import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TemporalService } from '../src/infrastructure/temporal/temporal.service';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('Onboarding E2E Integration', () => {
  let app: INestApplication;
  let temporalService: TemporalService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    // Set environment to skip worker creation for faster tests
    process.env.SKIP_TEMPORAL_WORKER = 'true';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    temporalService = moduleFixture.get<TemporalService>(TemporalService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test - correct order to avoid foreign key constraints
    // Delete in reverse dependency order: Payment → Customer → User → Address
    await prismaService.payment.deleteMany();
    await prismaService.customer.deleteMany();
    await prismaService.user.deleteMany();
    await prismaService.address.deleteMany();
  });

  describe('/onboarding/saga (POST)', () => {
    it('should complete full onboarding saga flow successfully', async () => {
      // Arrange
      const onboardingData = {
        name: 'John Doe',
        email: 'john.doe@test.com',
        street: '123 Test St',
        city: 'Test City',
        zipCode: '12345',
        country: 'USA',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
      };

      // Act - Send HTTP request to trigger onboarding saga
      const response = await request(app.getHttpServer())
        .post('/onboarding/saga')
        .send(onboardingData)
        .expect(201);

      // Assert - Check HTTP response
      expect(response.body).toMatchObject({
        message: 'Onboarding saga initiated successfully',
        status: 'success',
      });

      // Wait for workflow to complete (in a real test, you might want to poll or use workflow handles)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Assert - Check that entities were created in database
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
    }, 10000); // 10 second timeout for temporal workflow

    it('should handle invalid email gracefully', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email-format',
        street: '123 Test St',
        city: 'Test City',
        zipCode: '12345',
        country: 'USA',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/onboarding/saga')
        .send(invalidData)
        .expect(400); // Should return bad request for invalid email format

      // Wait a bit to ensure workflow had time to fail
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check that no user was created due to validation failure
      const users = await prismaService.user.findMany({
        where: { email: 'invalid-email-format' },
      });

      expect(users).toHaveLength(0);
    });

    it('should handle missing required fields', async () => {
      // Arrange
      const incompleteData = {
        name: 'John Doe',
        // Missing email, address, and customer data
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/onboarding/saga')
        .send(incompleteData)
        .expect(400); // Should return bad request for missing required fields
    });

    it('should handle duplicate email addresses', async () => {
      // Arrange - Create a user first
      await prismaService.user.create({
        data: {
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

      const duplicateData = {
        name: 'John Doe',
        email: 'duplicate@test.com',
        street: '123 Test St',
        city: 'Test City',
        zipCode: '12345',
        country: 'USA',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/onboarding/saga')
        .send(duplicateData)
        .expect(201); // Event should still be published

      // Wait for workflow to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Assert - Should still only have one user with that email
      const users = await prismaService.user.findMany({
        where: { email: 'duplicate@test.com' },
      });

      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Existing User'); // Original user should remain
    });
  });

  describe('Temporal Workflow Endpoint', () => {
    it('should complete temporal onboarding workflow successfully', async () => {
      // Arrange
      const onboardingData = {
        name: 'Temporal Test',
        email: 'temporal@test.com',
        street: '123 Temporal St',
        city: 'Temporal City',
        zipCode: '12345',
        country: 'USA',
        customerName: 'Temporal Test',
        customerPhone: '+1234567890',
      };

      // Act - Start the temporal workflow
      const response = await request(app.getHttpServer())
        .post('/onboarding/workflows/onboard-temporal')
        .send(onboardingData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Onboarding workflow started successfully',
        status: 'success',
        workflowId: expect.stringMatching(/^onboarding-processing--\d+$/),
      });

      // Wait for temporal workflow to complete
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Check that entities were created in database
      const users = await prismaService.user.findMany({
        where: { email: 'temporal@test.com' },
        include: { address: true },
      });

      expect(users.length).toBeGreaterThanOrEqual(1); 
      console.log(
        `Temporal workflow processing result: ${users.length > 0 ? 'SUCCESS' : 'FAILED/PENDING'}`,
      );
    }, 15000);
  });
});
