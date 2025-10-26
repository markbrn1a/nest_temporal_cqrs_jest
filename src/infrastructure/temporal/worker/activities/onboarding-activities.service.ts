import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../../contexts/user/application/commands/create-user.command';
import { CreateCustomerCommand } from '../../../../contexts/customer/application/commands/create-customer.command';
import { UserId } from '../../../../contexts/user/domain/value-objects/user-id.vo';
import { Email } from '../../../../contexts/user/domain/value-objects/email.vo';
import { Address } from '../../../../contexts/user/domain/value-objects/address.vo';
import { CustomerId } from '../../../../contexts/customer/domain/value-objects/customer-id.vo';
import { Phone } from '../../../../contexts/customer/domain/value-objects/phone.vo';
import { CustomerCreatedEvent } from '../../../../contexts/customer/domain/events/customer-created.event';

export interface ValidateOnboardingDataInput {
  name: string;
  email: string;
  customerName: string;
  customerPhone: string;
}

export interface CreateUserActivityInput {
  userId: string;
  name: string;
  email: string;
  address: any; // Address value object
}

export interface CreateCustomerActivityInput {
  userId: string;
  customerName: string;
  customerPhone: string;
}

export interface NotifyOnboardingCompletedInput {
  userId: string;
  customerId: string;
  name: string;
  email: string;
  customerPhone: string;
}

@Injectable()
export class OnboardingActivities {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async validateOnboardingData(input: ValidateOnboardingDataInput): Promise<void> {
    // Validate name
    if (!input.name || input.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.email || !emailRegex.test(input.email.trim())) {
      throw new Error('Invalid email format');
    }

    // Validate customer name
    if (!input.customerName || input.customerName.trim().length < 2) {
      throw new Error('Customer name must be at least 2 characters long');
    }

    // Validate customer phone
    if (!input.customerPhone || input.customerPhone.trim().length === 0) {
      throw new Error('Customer phone is required');
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(input.customerPhone.replace(/[\s\-\(\)]/g, ''))) {
      throw new Error('Invalid phone number format');
    }
  }

  async createUserActivity(input: CreateUserActivityInput): Promise<string> {
    // Convert plain address object to Address value object
    const address = Address.create(
      input.address.street,
      input.address.city,
      input.address.zipCode,
      input.address.country,
    );

    // Use CommandBus to create user through proper CQRS flow
    const user = await this.commandBus.execute(
      new CreateUserCommand(
        UserId.create(input.userId),
        input.name,
        Email.create(input.email),
        address,
      ),
    );

    return user.getId().getValue();
  }

  async createCustomerActivity(input: CreateCustomerActivityInput): Promise<string> {
    // Use CommandBus to create customer through proper CQRS flow
    const customer = await this.commandBus.execute(
      new CreateCustomerCommand(
        CustomerId.create(),
        input.customerName,
        Phone.create(input.customerPhone),
        input.userId,
      ),
    );

    return customer.getId().getValue();
  }

  async notifyOnboardingCompleted(input: NotifyOnboardingCompletedInput): Promise<void> {
    // Publish domain events through EventBus
    // Note: UserCreatedEvent doesn't need Address for notification
    // The Address is already persisted with the User

    await this.eventBus.publish(
      new CustomerCreatedEvent(
        CustomerId.create(input.customerId),
        input.name, // Using user name as customer name
        input.customerPhone,
        input.userId,
      ),
    );
  }
}
