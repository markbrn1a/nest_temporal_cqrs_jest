import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DomainEventBus } from './domain-event-bus.interface';
import { DomainEvent } from '../../domain/base/domain-event.interface';

@Injectable()
export class NestEventBusAdapter implements DomainEventBus {
  constructor(private readonly eventBus: EventBus) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.eventBus.publish(event);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.eventBus.publish(event)));
  }
}
