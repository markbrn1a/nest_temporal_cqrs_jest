import { DomainEvent } from './domain-event.interface';

export abstract class AggregateRoot {
  private domainEvents: DomainEvent[] = [];

  protected apply(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  public getUncommittedEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public markEventsAsCommitted(): void {
    this.domainEvents = [];
  }
}
