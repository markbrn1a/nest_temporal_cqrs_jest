import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartCreateUserWorkflowCommand } from '../start-create-user-workflow.command';
import { TemporalService } from '../../../../../infrastructure/temporal/temporal.service';

@CommandHandler(StartCreateUserWorkflowCommand)
export class StartCreateUserWorkflowHandler implements ICommandHandler<StartCreateUserWorkflowCommand> {
  constructor(private readonly temporalService: TemporalService) {}

  async execute(command: StartCreateUserWorkflowCommand): Promise<{ workflowId: string; message: string }> {
    const workflowId = `create-user-${Date.now()}`;
    
    await this.temporalService.startWorkflow('createUserWorkflow', {
      taskQueue: 'main-task-queue',
      args: [command],
      workflowId: workflowId,
    });

    return {
      workflowId,
      message: 'Create User workflow started successfully',
    };
  }
}
