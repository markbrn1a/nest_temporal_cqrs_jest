import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartCreateCustomerWorkflowCommand } from '../start-create-customer-workflow.command';
import { TemporalService } from '../../../../../infrastructure/temporal/temporal.service';

@CommandHandler(StartCreateCustomerWorkflowCommand)
export class StartCreateCustomerWorkflowHandler implements ICommandHandler<StartCreateCustomerWorkflowCommand> {
  constructor(private readonly temporalService: TemporalService) {}

  async execute(command: StartCreateCustomerWorkflowCommand): Promise<{ workflowId: string; message: string }> {
    const workflowId = `create-customer-${Date.now()}`;
    
    await this.temporalService.startWorkflow('createCustomerWorkflow', {
      taskQueue: 'main-task-queue',
      args: [command],
      workflowId: workflowId,
    });

    return {
      workflowId,
      message: 'Create Customer workflow started successfully',
    };
  }
}
