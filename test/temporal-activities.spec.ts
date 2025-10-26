import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingActivities } from '../src/infrastructure/temporal/worker/activities/onboarding-activities.service';
import { PaymentActivities } from '../src/infrastructure/temporal/worker/activities/payment-activities.service';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { PrismaModule } from '../src/infrastructure/database/prisma.module';

describe('Temporal Activities Unit Tests', () => {
  let onboardingActivities: OnboardingActivities;
  let paymentActivities: PaymentActivities;
  let commandBus: CommandBus;
  let eventBus: EventBus;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        OnboardingActivities,
        PaymentActivities,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    onboardingActivities = module.get<OnboardingActivities>(OnboardingActivities);
    paymentActivities = module.get<PaymentActivities>(PaymentActivities);
    commandBus = module.get<CommandBus>(CommandBus);
    eventBus = module.get<EventBus>(EventBus);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // Clean up database
    await prismaService.payment.deleteMany();
    await prismaService.customer.deleteMany();
    await prismaService.user.deleteMany();
    await prismaService.address.deleteMany();
  });

  describe('OnboardingActivities', () => {
    describe('validateOnboardingData', () => {
      it('should validate correct onboarding data', async () => {
        // Arrange
        const validData = {
          name: 'John Doe',
          email: 'john.doe@test.com',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
        };

        // Act & Assert - Should not throw
        await expect(onboardingActivities.validateOnboardingData(validData)).resolves.not.toThrow();
      });

      it('should reject invalid email format', async () => {
        // Arrange
        const invalidData = {
          name: 'John Doe',
          email: 'invalid-email-format',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
        };

        // Act & Assert
        await expect(onboardingActivities.validateOnboardingData(invalidData))
          .rejects.toThrow('Invalid email format');
      });

      it('should reject short name', async () => {
        // Arrange
        const invalidData = {
          name: 'A', // Too short
          email: 'john.doe@test.com',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
        };

        // Act & Assert
        await expect(onboardingActivities.validateOnboardingData(invalidData))
          .rejects.toThrow('Name must be at least 2 characters long');
      });

      it('should reject invalid phone format', async () => {
        // Arrange
        const invalidData = {
          name: 'John Doe',
          email: 'john.doe@test.com',
          customerName: 'John Doe',
          customerPhone: 'invalid-phone',
        };

        // Act & Assert
        await expect(onboardingActivities.validateOnboardingData(invalidData))
          .rejects.toThrow('Invalid phone number format');
      });
    });

    describe('createUserActivity', () => {
      it('should create user successfully', async () => {
        // Arrange
        const mockUser = {
          getId: () => ({ getValue: () => 'test-user-123' }),
        };

        jest.spyOn(commandBus, 'execute').mockResolvedValue(mockUser);

        const userInput = {
          userId: 'test-user-123',
          name: 'John Doe',
          email: 'john.doe@test.com',
          address: {
            street: '123 Test St',
            city: 'Test City',
            zipCode: '12345',
            country: 'USA',
          },
        };

        // Act
        const result = await onboardingActivities.createUserActivity(userInput);

        // Assert
        expect(result).toBe('test-user-123');
        expect(commandBus.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.any(Object),
            name: 'John Doe',
            email: expect.any(Object),
            address: expect.any(Object),
          })
        );
      });
    });

    describe('createCustomerActivity', () => {
      it('should create customer successfully', async () => {
        // Arrange
        const mockCustomer = {
          getId: () => ({ getValue: () => 'test-customer-123' }),
        };

        jest.spyOn(commandBus, 'execute').mockResolvedValue(mockCustomer);

        const customerInput = {
          userId: 'test-user-123',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
        };

        // Act
        const result = await onboardingActivities.createCustomerActivity(customerInput);

        // Assert
        expect(result).toBe('test-customer-123');
        expect(commandBus.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.any(Object),
            name: 'John Doe',
            phone: expect.any(Object),
            userId: 'test-user-123',
          })
        );
      });
    });

    describe('notifyOnboardingCompleted', () => {
      it('should publish customer created event', async () => {
        // Arrange
        jest.spyOn(eventBus, 'publish').mockResolvedValue(undefined);

        const notificationInput = {
          userId: 'test-user-123',
          customerId: 'test-customer-123',
          name: 'John Doe',
          email: 'john.doe@test.com',
          customerPhone: '+1234567890',
        };

        // Act
        await onboardingActivities.notifyOnboardingCompleted(notificationInput);

        // Assert
        expect(eventBus.publish).toHaveBeenCalledWith(
          expect.objectContaining({
            customerId: expect.any(Object),
            name: 'John Doe',
            phone: '+1234567890',
            userId: 'test-user-123',
          })
        );
      });
    });
  });

  describe('PaymentActivities', () => {
    describe('validatePayment', () => {
      it('should validate correct payment data', async () => {
        // Arrange
        const validPayment = {
          userId: 'test-user-123',
          customerId: 'test-customer-123',
          amount: 99.99,
        };

        // Act & Assert - Should not throw
        await expect(paymentActivities.validatePayment(validPayment)).resolves.not.toThrow();
      });

      it('should reject negative amount', async () => {
        // Arrange
        const invalidPayment = {
          userId: 'test-user-123',
          customerId: 'test-customer-123',
          amount: -50,
        };

        // Act & Assert
        await expect(paymentActivities.validatePayment(invalidPayment))
          .rejects.toThrow('Payment amount must be greater than zero');
      });

      it('should reject amount exceeding limit', async () => {
        // Arrange
        const invalidPayment = {
          userId: 'test-user-123',
          customerId: 'test-customer-123',
          amount: 2000000, // Exceeds 1,000,000 limit
        };

        // Act & Assert
        await expect(paymentActivities.validatePayment(invalidPayment))
          .rejects.toThrow('Payment amount cannot exceed 1,000,000');
      });

      it('should reject empty user ID', async () => {
        // Arrange
        const invalidPayment = {
          userId: '',
          customerId: 'test-customer-123',
          amount: 99.99,
        };

        // Act & Assert
        await expect(paymentActivities.validatePayment(invalidPayment))
          .rejects.toThrow('User ID is required');
      });

      it('should reject empty customer ID', async () => {
        // Arrange
        const invalidPayment = {
          userId: 'test-user-123',
          customerId: '',
          amount: 99.99,
        };

        // Act & Assert
        await expect(paymentActivities.validatePayment(invalidPayment))
          .rejects.toThrow('Customer ID is required');
      });
    });

    describe('processPayment', () => {
      it('should process payment successfully', async () => {
        // Arrange
        const mockPayment = {
          getId: () => ({ getValue: () => 'test-payment-123' }),
        };

        jest.spyOn(commandBus, 'execute').mockResolvedValue(mockPayment);

        const paymentInput = {
          paymentId: 'test-payment-123',
          userId: 'test-user-123',
          customerId: 'test-customer-123',
          amount: 99.99,
        };

        // Act
        const result = await paymentActivities.processPayment(paymentInput);

        // Assert
        expect(result).toBe('test-payment-123');
        expect(commandBus.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentId: expect.any(Object),
            userId: 'test-user-123',
            customerId: 'test-customer-123',
            amount: expect.any(Object),
          })
        );
      });
    });

    describe('notifyPaymentCompleted', () => {
      it('should log payment completion', async () => {
        // Arrange
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        const notificationInput = {
          paymentId: 'test-payment-123',
          userId: 'test-user-123',
          customerId: 'test-customer-123',
          amount: 99.99,
        };

        // Act
        await paymentActivities.notifyPaymentCompleted(notificationInput);

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(
          'Payment completed: test-payment-123 for user test-user-123 to customer test-customer-123 amount 99.99'
        );

        consoleSpy.mockRestore();
      });
    });
  });
});
