import { DomainEvent } from '../../../../shared/domain/base/domain-event.interface';
import { randomUUID } from 'crypto';
import { Address } from '../value-objects/address.vo';

export class UserCreatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly address: Address,
  ) {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
  }
}
