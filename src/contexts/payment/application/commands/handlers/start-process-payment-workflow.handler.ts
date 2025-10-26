import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartProcessPaymentWorkflowCommand } from '../start-process-payment-workflow.command';
import { TemporalService } from '../../../../../infrastructure/temporal/temporal.service';

@CommandHandler(StartProcessPaymentWorkflowCommand)
export class StartProcessPaymentWorkflowHandler implements ICommandHandler<StartProcessPaymentWorkflowCommand> {
  constructor(private readonly temporalService: TemporalService) {}

  async execute(command: StartProcessPaymentWorkflowCommand): Promise<{ workflowId: string; message: string }> {
    const workflowId = `process-payment-${Date.now()}`;
    
    await this.temporalService.startWorkflow('processPaymentWorkflow', {
      taskQueue: 'main-task-queue',
      args: [command],
      workflowId: workflowId,
    });

    return {
      workflowId,
      message: 'Process Payment workflow started successfully',
    };
  }
}
