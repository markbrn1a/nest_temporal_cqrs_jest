import { DomainEvent } from '../../../../shared/domain/base/domain-event.interface';
import { CustomerId } from '../value-objects/customer-id.vo';

export class CustomerCreatedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(
    public readonly customerId: CustomerId,
    public readonly name: string,
    public readonly phone: string,
    public readonly userId: string,
  ) {
    this.occurredOn = new Date();
    this.eventId = `customer-created-${customerId.getValue()}`;
  }
}
