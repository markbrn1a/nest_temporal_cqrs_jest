import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { processOnboardingWorkflow } from '../src/infrastructure/temporal/worker/workflows/onboarding-processing.workflow';
import { PaymentActivities } from '../src/infrastructure/temporal/worker/activities/payment-activities.service';
import { OnboardingActivities } from '../src/infrastructure/temporal/worker/activities/onboarding-activities.service';
import { v4 as uuid } from 'uuid';
import { Worker } from '@temporalio/worker';
import { TEMPORAL_CLIENT } from '../src/infrastructure/temporal/temporal.factory';
import { ApplicationFailure } from '@temporalio/common';

describe('Temporal Workflow Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testEnv: TestWorkflowEnvironment;
  let onboardingActivities: OnboardingActivities;
  let paymentActivities: PaymentActivities;

  beforeAll(async () => {
    // Set environment to skip worker creation for faster tests
    process.env.SKIP_TEMPORAL_WORKER = 'true';

    try {
      // Create test environment with time skipping for faster tests
      testEnv = await TestWorkflowEnvironment.createTimeSkipping();

      // Create mock temporal client for the test to prevent real server connections
      const mockTemporalClient = {
        workflow: {
          start: jest.fn(),
          execute: jest.fn(),
          getHandle: jest.fn(),
        },
        namespace: 'default',
      };

      // Create NestJS testing module with mocked temporal client
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(TEMPORAL_CLIENT)
        .useValue(mockTemporalClient)
        .compile();

      app = moduleFixture.createNestApplication();
      prismaService = moduleFixture.get<PrismaService>(PrismaService);
      onboardingActivities =
        moduleFixture.get<OnboardingActivities>(OnboardingActivities);
      paymentActivities =
        moduleFixture.get<PaymentActivities>(PaymentActivities);
      await app.init();
    } catch (error) {
      console.error('Failed to setup test environment:', error);
      throw error;
    }
  }, 90000); // Increase timeout to 90 seconds

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (testEnv) {
      await testEnv.teardown();
    }
  });

  beforeEach(async () => {
    await prismaService.payment.deleteMany();
    await prismaService.customer.deleteMany();
    await prismaService.user.deleteMany();
    await prismaService.address.deleteMany();
  });

  describe('Onboarding Workflow Tests', () => {
    it('should complete onboarding workflow successfully', async () => {
      // Arrange
      const workflowInput = {
        userId: 'test-user-123',
        name: 'John Doe',
        email: 'john.doe@test.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345',
          country: 'USA',
        },
        customerName: 'John Doe',
        customerPhone: '+1234567890',
      };

      // Create mock activities that use the real NestJS services
      const mockActivities = {
        validateOnboardingData: async (input: any) => {
          try {
            return await onboardingActivities.validateOnboardingData(input);
          } catch (error) {
            // Convert validation errors to ApplicationFailure to prevent retries
            throw ApplicationFailure.nonRetryable(
              error instanceof Error ? error.message : 'Validation failed',
              'ValidationError',
            );
          }
        },
        createUserActivity:
          onboardingActivities.createUserActivity.bind(onboardingActivities),
        createCustomerActivity:
          onboardingActivities.createCustomerActivity.bind(
            onboardingActivities,
          ),
        notifyOnboardingCompleted:
          onboardingActivities.notifyOnboardingCompleted.bind(
            onboardingActivities,
          ),
      };

      // Create worker with mocked activities
      const worker = await Worker.create({
        connection: testEnv.nativeConnection,
        taskQueue: 'test',
        workflowsPath: require.resolve(
          '../src/infrastructure/temporal/worker/workflows/onboarding-processing.workflow',
        ),
        activities: mockActivities,
      });

      // Act - Execute workflow using worker.runUntil
      const result = await worker.runUntil(
        testEnv.client.workflow.execute(processOnboardingWorkflow, {
          workflowId: uuid(),
          taskQueue: 'test',
          args: [workflowInput],
        }),
      );

      // Assert - Check workflow result
      expect(result).toMatchObject({
        userId: 'test-user-123',
        customerId: expect.any(String),
        status: 'completed',
      });
      expect(result.error).toBeUndefined();

      // Assert - Check database state
      const users = await prismaService.user.findMany({
        where: { email: 'john.doe@test.com' },
        include: { address: true },
      });

      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        name: 'John Doe',
        email: 'john.doe@test.com',
        address: expect.objectContaining({
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345',
          country: 'USA',
        }),
      });

      const customers = await prismaService.customer.findMany({
        where: { userId: users[0].id },
      });

      expect(customers).toHaveLength(1);
      expect(customers[0]).toMatchObject({
        name: 'John Doe',
        phone: '+1234567890',
        userId: users[0].id,
      });
    });

    it('should handle validation errors in workflow', async () => {
      // Arrange
      const invalidInput = {
        userId: 'test-user-456',
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
        address: {
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345',
          country: 'USA',
        },
        customerName: 'John Doe',
        customerPhone: '+1234567890',
      };

      // Create mock activities
      const mockActivities = {
        validateOnboardingData: async (input: any) => {
          try {
            return await onboardingActivities.validateOnboardingData(input);
          } catch (error) {
            // Convert validation errors to ApplicationFailure to prevent retries
            throw ApplicationFailure.nonRetryable(
              error instanceof Error ? error.message : 'Validation failed',
              'ValidationError',
            );
          }
        },
        createUserActivity:
          onboardingActivities.createUserActivity.bind(onboardingActivities),
        createCustomerActivity:
          onboardingActivities.createCustomerActivity.bind(
            onboardingActivities,
          ),
        notifyOnboardingCompleted:
          onboardingActivities.notifyOnboardingCompleted.bind(
            onboardingActivities,
          ),
      };

      // Create worker with mocked activities
      const worker = await Worker.create({
        connection: testEnv.nativeConnection,
        taskQueue: 'test',
        workflowsPath: require.resolve(
          '../src/infrastructure/temporal/worker/workflows/onboarding-processing.workflow',
        ),
        activities: mockActivities,
      });

      // Act - Execute workflow
      const result = await worker.runUntil(
        testEnv.client.workflow.execute(processOnboardingWorkflow, {
          workflowId: uuid(),
          taskQueue: 'test',
          args: [invalidInput],
        }),
      );

      // Assert - Check workflow failed
      expect(result).toMatchObject({
        userId: 'test-user-456',
        customerId: '',
        status: 'failed',
      });
      expect(result.error).toBeDefined();
      expect(result.error).toMatch(
        /Activity task failed|Name must be at least 2 characters long/,
      );

      // Assert - No data should be created
      const users = await prismaService.user.findMany({
        where: { email: 'invalid-email' },
      });
      expect(users).toHaveLength(0);
    });
  });
});
