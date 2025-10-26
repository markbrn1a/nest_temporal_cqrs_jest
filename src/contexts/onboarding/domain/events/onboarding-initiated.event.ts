import { DomainEvent } from '../../../../shared/domain/base/domain-event.interface';

export class OnboardingInitiatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly address: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    },
    public readonly customerName: string,
    public readonly customerPhone: string,
    occurredOn: Date = new Date(),
  ) {
    this.eventId = `onboarding-initiated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.occurredOn = occurredOn;
  }
}
