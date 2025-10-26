import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';
import { CustomerId } from '../value-objects/customer-id.vo';
import { Phone } from '../value-objects/phone.vo';
import { CustomerCreatedEvent } from '../events/customer-created.event';

export class Customer extends AggregateRoot {
  private constructor(
    private readonly _id: CustomerId,
    private readonly _name: string,
    private readonly _phone: Phone,
    private readonly _userId: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {
    super();
  }

  public static create(
    id: CustomerId,
    name: string,
    phone: Phone,
    userId: string,
  ): Customer {
    if (!name || name.trim().length === 0) {
      throw new Error('Customer name cannot be empty');
    }

    if (name.length > 100) {
      throw new Error('Customer name cannot exceed 100 characters');
    }

    const now = new Date();
    const customer = new Customer(
      id,
      name,
      phone,
      userId,
      now,
      now,
    );

    // Raise domain event
    customer.addDomainEvent(
      new CustomerCreatedEvent(id, name, phone.getValue(), userId)
    );

    return customer;
  }

  public static reconstitute(
    id: CustomerId,
    name: string,
    phone: Phone,
    userId: string,
    createdAt: Date,
    updatedAt: Date,
  ): Customer {
    return new Customer(id, name, phone, userId, createdAt, updatedAt);
  }

  public getId(): CustomerId {
    return this._id;
  }

  public getName(): string {
    return this._name;
  }

  public getPhone(): Phone {
    return this._phone;
  }

  public getUserId(): string {
    return this._userId;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }
}
