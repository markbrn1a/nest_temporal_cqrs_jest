import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { CreateCustomerCommand } from '../create-customer.command';
import { Customer } from '../../../domain/entities/customer.entity';
import { type CustomerRepositoryPort, CUSTOMER_REPOSITORY } from '../../ports/customer-repository.port';
import { type DomainEventBus, DOMAIN_EVENT_BUS } from '../../../../../shared/integration/event-bus/domain-event-bus.interface';

@Injectable()
@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler implements ICommandHandler<CreateCustomerCommand> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(DOMAIN_EVENT_BUS)
    private readonly domainEventBus: DomainEventBus,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<Customer> {
    const { id, name, phone, userId } = command;

    // Create Customer aggregate
    const customer = Customer.create(id, name, phone, userId);

    // Persist to repository
    await this.customerRepository.save(customer);

    // Publish domain events
    const events = customer.getUncommittedEvents();
    for (const event of events) {
      await this.domainEventBus.publish(event);
    }
    customer.markEventsAsCommitted();

    return customer;
  }
}
