import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Worker } from '@temporalio/worker';
import { join } from 'path';
import { OnboardingActivities } from './activities/onboarding-activities.service';
import { PaymentActivities } from './activities/payment-activities.service';

@Injectable()
export class TemporalWorkerService implements OnApplicationShutdown {
  private worker: Worker | null = null;
  private readonly logger = new Logger(TemporalWorkerService.name);

  constructor(
    private readonly onboardingActivities: OnboardingActivities,
    private readonly paymentActivities: PaymentActivities,
  ) {}

  async initializeWorker(): Promise<void> {
    // Skip worker creation during tests if needed
    if (process.env.NODE_ENV === 'test' && process.env.SKIP_TEMPORAL_WORKER === 'true') {
      this.logger.log('Skipping Temporal Worker creation in test environment');
      return;
    }

    try {
      this.logger.log('Initializing Temporal Worker...');
          // Ensure DI container is ready first
    
      this.worker = await Worker.create({
        workflowsPath: join(__dirname, './workflows'),
        activities: {
          // Onboarding activities
          validateOnboardingData: this.onboardingActivities.validateOnboardingData.bind(this.onboardingActivities),
          createUserActivity: this.onboardingActivities.createUserActivity.bind(this.onboardingActivities),
          createCustomerActivity: this.onboardingActivities.createCustomerActivity.bind(this.onboardingActivities),
          notifyOnboardingCompleted: this.onboardingActivities.notifyOnboardingCompleted.bind(this.onboardingActivities),
          // Payment activities
          validatePayment: this.paymentActivities.validatePayment.bind(this.paymentActivities),
          processPayment: this.paymentActivities.processPayment.bind(this.paymentActivities),
          notifyPaymentCompleted: this.paymentActivities.notifyPaymentCompleted.bind(this.paymentActivities),
        },
        taskQueue: 'main-task-queue',
      });

      // Start the worker
      const runPromise = this.worker.run();

      // Handle worker errors
      runPromise.catch((err) => {
        this.logger.error('Temporal Worker error:', err);
      });

      // Store the run promise on the worker for potential access
      (this.worker as any).runPromise = runPromise;

      this.logger.log('Temporal Worker initialized and started successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Temporal Worker:', error);
      throw error;
    }
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    if (!this.worker) {
      this.logger.log('No Temporal worker to shutdown');
      return;
    }

    this.logger.log(`Shutting down Temporal worker due to ${signal}`);
    try {
      await this.worker.shutdown();
      this.logger.log('Temporal worker shutdown completed');
    } catch (error) {
      this.logger.error('Error during Temporal worker shutdown:', error);
    }
  }

  getWorker(): Worker | null {
    return this.worker;
  }
}
