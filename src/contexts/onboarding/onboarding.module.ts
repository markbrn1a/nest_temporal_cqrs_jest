import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OnboardingController } from './presentation/controllers/onboarding.controller';
import { StartOnboardingHandler } from './application/commands/handlers/start-onboarding-saga.handler';
import { StartOnboardingTemporalHandler } from './application/commands/handlers/start-onboarding-temporal.handler';
import { StartCreateUserWorkflowHandler } from './application/commands/handlers/start-create-user-workflow.handler';
import { StartCreateCustomerWorkflowHandler } from './application/commands/handlers/start-create-customer-workflow.handler';
import { StartOnboardingComposedWorkflowHandler } from './application/commands/handlers/start-onboarding-composed-workflow.handler';
import { EventBusModule } from '../../shared/integration/event-bus/event-bus.module';
import { TemporalModule } from '../../infrastructure/temporal/temporal.module';

@Module({
  imports: [CqrsModule, EventBusModule, TemporalModule],
  controllers: [OnboardingController],
  providers: [
    StartOnboardingHandler,
    StartOnboardingTemporalHandler,
    StartCreateUserWorkflowHandler,
    StartCreateCustomerWorkflowHandler,
    StartOnboardingComposedWorkflowHandler,
    StartOnboardingTemporalHandler,
  ],
})
export class OnboardingModule {}
