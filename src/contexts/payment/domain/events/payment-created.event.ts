import { DomainEvent } from '../../../../shared/domain/base/domain-event.interface';

export class PaymentCreatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly customerId: string,
    public readonly amount: number,
    occurredOn: Date = new Date(),
  ) {
    this.eventId = `payment-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.occurredOn = occurredOn;
  }
}
