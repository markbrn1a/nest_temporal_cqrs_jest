import { DomainEvent } from '../../domain/base/domain-event.interface';

export interface DomainEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

export const DOMAIN_EVENT_BUS = Symbol('DOMAIN_EVENT_BUS');
