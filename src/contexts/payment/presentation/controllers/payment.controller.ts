import { Controller, Post, Get, Body, Param, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { ProcessPaymentWorkflowDto } from '../dtos/process-payment-workflow.dto';
import { CreatePaymentCommand } from '../../application/commands/create-payment.command';
import { StartProcessPaymentWorkflowCommand } from '../../application/commands/start-process-payment-workflow.command';
import { GetPaymentQuery } from '../../application/queries/get-payment.query';
import { PaymentId } from '../../domain/value-objects/payment-id.vo';
import { Amount } from '../../domain/value-objects/amount.vo';
import { Payment } from '../../domain/entities/payment.entity';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createPayment(@Body(ValidationPipe) dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const paymentId = PaymentId.create();
    const amount = Amount.create(dto.amount);

    const command = new CreatePaymentCommand(
      paymentId,
      dto.userId,
      dto.customerId,
      amount,
    );

    const payment = await this.commandBus.execute<CreatePaymentCommand, Payment>(command);

    return new PaymentResponseDto(payment);
  }

  @Post('workflows/process')
  async startProcessPaymentWorkflow(@Body(ValidationPipe) dto: ProcessPaymentWorkflowDto): Promise<{ workflowId: string; message: string }> {
    const command = new StartProcessPaymentWorkflowCommand(
      dto.paymentId,
      dto.userId,
      dto.customerId,
      dto.amount,
    );

    return await this.commandBus.execute(command);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    const query = new GetPaymentQuery(PaymentId.create(id));
    const payment = await this.queryBus.execute<GetPaymentQuery, Payment | null>(query);

    if (!payment) {
      throw new Error('Payment not found');
    }

    return new PaymentResponseDto(payment);
  }
}