import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { StartOnboardingCommand } from '../start-onboarding-saga.command';
import { OnboardingInitiatedEvent } from '../../../domain/events/onboarding-initiated.event';

@CommandHandler(StartOnboardingCommand)
export class StartOnboardingHandler implements ICommandHandler<StartOnboardingCommand> {
  constructor(private readonly eventBus: EventBus) {}

  async execute(command: StartOnboardingCommand): Promise<void> {
    const event = new OnboardingInitiatedEvent(
      command.userId,
      command.name,
      command.email,
      command.address,
      command.customerName,
      command.customerPhone,
    );

    this.eventBus.publish(event);
  }
}
