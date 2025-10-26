import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreatePaymentCommand } from '../create-payment.command';
import { Payment } from '../../../domain/entities/payment.entity';
import { PAYMENT_REPOSITORY } from '../../ports/payment-repository.port';
import { Inject } from '@nestjs/common';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: any,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<Payment> {
    const payment = Payment.create(
      command.paymentId,
      command.userId,
      command.customerId,
      command.amount,
    );

    await this.paymentRepository.save(payment);

    // Publish domain events
    payment.getUncommittedEvents().forEach(event => {
      this.eventBus.publish(event);
    });
    payment.markEventsAsCommitted();

    return payment;
  }
}
