import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartOnboardingTemporalCommand } from '../start-onboarding-temporal.command';
import { TemporalService } from '../../../../../infrastructure/temporal/temporal.service';

@CommandHandler(StartOnboardingTemporalCommand)
export class StartOnboardingTemporalHandler implements ICommandHandler<StartOnboardingTemporalCommand> {
  constructor(private readonly temporalService: TemporalService) {}

  async execute(command: StartOnboardingTemporalCommand): Promise<{ workflowId: string }> {
    const workflowId = `onboarding-processing--${Date.now()}`;
    
    await this.temporalService.startWorkflow('processOnboardingWorkflow', {
      taskQueue: 'main-task-queue',
      args: [{
        userId: command.userId,
        name: command.name,
        email: command.email,
        address: command.address,
        customerName: command.customerName,
        customerPhone: command.customerPhone,
      }],
      workflowId: workflowId,
    });

    return { workflowId };
  }
}
