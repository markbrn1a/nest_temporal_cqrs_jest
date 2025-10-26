import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TemporalWorkerService } from './temporal-worker.service';
import { OnboardingActivities } from './activities/onboarding-activities.service';
import { PaymentActivities } from './activities/payment-activities.service';

@Module({
  imports: [CqrsModule],
  providers: [
    TemporalWorkerService,
    OnboardingActivities,
    PaymentActivities,
  ],
  exports: [TemporalWorkerService],
})
export class TemporalWorkerModule implements OnModuleInit {
  constructor(private readonly workerService: TemporalWorkerService) {}

  async onModuleInit(): Promise<void> {
    // Initialize the worker after all modules are ready
    // This ensures DI dependencies are fully available
    await this.workerService.initializeWorker();
  }
}
