import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { OnboardingActivities } from '../src/infrastructure/temporal/worker/activities/onboarding-activities.service';
import { PaymentActivities } from '../src/infrastructure/temporal/worker/activities/payment-activities.service';

// Import workflow functions
import { processOnboardingWorkflow } from '../src/infrastructure/temporal/worker/workflows/onboarding-processing.workflow';
import { processPaymentWorkflow } from '../src/infrastructure/temporal/worker/workflows/process-payment.workflow';

describe('Temporal Workflows Integration Tests', () => {
  let testEnv: TestWorkflowEnvironment;
  let app: INestApplication;
  let prismaService: PrismaService;
  let onboardingActivities: OnboardingActivities;
  let paymentActivities: PaymentActivities;

  beforeAll(async () => {
    // Create test environment with in-memory Temporal server
    testEnv = await TestWorkflowEnvironment.createLocal();

    // Create NestJS testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],

    }).compile();

    app = moduleFixture.createNestApplication();
    
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    onboardingActivities = moduleFixture.get<OnboardingActivities>(OnboardingActivities);
    paymentActivities = moduleFixture.get<PaymentActivities>(PaymentActivities);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await testEnv.teardown();
  });

  beforeEach(async () => {
    // Clean up database before each test (delete children first)
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

      // Act - Execute workflow using TestWorkflowEnvironment
      const result = await testEnv.client.workflow.execute(processOnboardingWorkflow, {
        args: [workflowInput],
        taskQueue: 'test-task-queue',
        workflowId: `test-onboarding-${Date.now()}`,
      });

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

      // Act - Execute workflow
      const result = await testEnv.workflowClient.execute(processOnboardingWorkflow, {
        args: [invalidInput],
        taskQueue: 'test-task-queue',
        workflowId: `test-onboarding-invalid-${Date.now()}`,
      });

      // Assert - Check workflow failed
      expect(result).toMatchObject({
        userId: 'test-user-456',
        customerId: '',
        status: 'failed',
      });
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Name must be at least 2 characters long');

      // Assert - No data should be created
      const users = await prismaService.user.findMany({
        where: { email: 'invalid-email' },
      });
      expect(users).toHaveLength(0);
    });

    it('should handle duplicate email gracefully', async () => {
      // Arrange - Create existing user
      await prismaService.user.create({
        data: {
          id: 'existing-user-123',
          name: 'Existing User',
          email: 'duplicate@test.com',
          address: {
            create: {
              street: '456 Existing St',
              city: 'Existing City',
              zipCode: '67890',
              country: 'USA',
            },
          },
        },
      });

      const duplicateInput = {
        userId: 'test-user-789',
        name: 'John Doe',
        email: 'duplicate@test.com', // Duplicate email
        address: {
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345',
          country: 'USA',
        },
        customerName: 'John Doe',
        customerPhone: '+1234567890',
      };

      // Act - Execute workflow
      const result = await testEnv.workflowClient.execute(processOnboardingWorkflow, {
        args: [duplicateInput],
        taskQueue: 'test-task-queue',
        workflowId: `test-onboarding-duplicate-${Date.now()}`,
      });

      // Assert - Workflow should fail due to duplicate email
      expect(result).toMatchObject({
        userId: 'test-user-789',
        customerId: '',
        status: 'failed',
      });
      expect(result.error).toBeDefined();

      // Assert - Only original user should exist
      const users = await prismaService.user.findMany({
        where: { email: 'duplicate@test.com' },
      });
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Existing User');
    });
  });

  describe('Payment Workflow Tests', () => {
    it('should complete payment workflow successfully', async () => {
      // Arrange - Create user and customer first
      const user = await prismaService.user.create({
        data: {
          id: 'payment-user-123',
          name: 'Payment User',
          email: 'payment@test.com',
          address: {
            create: {
              street: '123 Payment St',
              city: 'Payment City',
              zipCode: '12345',
              country: 'USA',
            },
          },
        },
      });

      const customer = await prismaService.customer.create({
        data: {
          id: 'payment-customer-123',
          name: 'Payment Customer',
          phone: '+1234567890',
          userId: user.id,
        },
      });

      const paymentInput = {
        paymentId: 'payment-123',
        userId: user.id,
        customerId: customer.id,
        amount: 99.99,
      };

      // Act - Execute workflow
      const result = await testEnv.workflowClient.execute(processPaymentWorkflow, {
        args: [paymentInput],
        taskQueue: 'test-task-queue',
        workflowId: `test-payment-${Date.now()}`,
      });

      // Assert - Check workflow result
      expect(result).toMatchObject({
        paymentId: 'payment-123',
        status: 'completed',
      });
      expect(result.error).toBeUndefined();

      // Assert - Check payment was created
      const payments = await prismaService.payment.findMany({
        where: { id: 'payment-123' },
      });

      expect(payments).toHaveLength(1);
      expect(payments[0]).toMatchObject({
        id: 'payment-123',
        userId: user.id,
        customerId: customer.id,
        amount: 99.99,
        status: 'COMPLETED',
      });
    });

    it('should handle invalid payment amount', async () => {
      // Arrange
      const invalidPaymentInput = {
        paymentId: 'invalid-payment-123',
        userId: 'some-user-id',
        customerId: 'some-customer-id',
        amount: -50, // Invalid negative amount
      };

      // Act - Execute workflow
      const result = await testEnv.workflowClient.execute(processPaymentWorkflow, {
        args: [invalidPaymentInput],
        taskQueue: 'test-task-queue',
        workflowId: `test-payment-invalid-${Date.now()}`,
      });

      // Assert - Check workflow failed
      expect(result).toMatchObject({
        paymentId: 'invalid-payment-123',
        status: 'failed',
      });
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Payment amount must be greater than zero');

      // Assert - No payment should be created
      const payments = await prismaService.payment.findMany({
        where: { id: 'invalid-payment-123' },
      });
      expect(payments).toHaveLength(0);
    });
  });
});
