import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartOnboardingComposedWorkflowCommand } from '../start-onboarding-composed-workflow.command';
import { TemporalService } from '../../../../../infrastructure/temporal/temporal.service';

@CommandHandler(StartOnboardingComposedWorkflowCommand)
export class StartOnboardingComposedWorkflowHandler implements ICommandHandler<StartOnboardingComposedWorkflowCommand> {
  constructor(private readonly temporalService: TemporalService) {}

  async execute(command: StartOnboardingComposedWorkflowCommand): Promise<{ workflowId: string; message: string }> {
    const workflowId = `onboarding-composed-${Date.now()}`;
    
    await this.temporalService.startWorkflow('onboardingComposedWorkflow', {
      taskQueue: 'main-task-queue',
      args: [command],
      workflowId: workflowId,
    });

    return {
      workflowId,
      message: 'Onboarding Composed workflow started successfully',
    };
  }
}
