import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { Address } from '../value-objects/address.vo';
import { UserCreatedEvent } from '../events/user-created.event';

export class User extends AggregateRoot {
  constructor(
    private readonly id: UserId,
    private name: string,
    private email: Email,
    private address: Address,
    private addressId: string,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {
    super();
  }

  static create(
    id: UserId,
    name: string,
    email: Email,
    address: Address,
  ): User {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    const addressId = new UserId().getValue(); // Generate address ID

    const user = new User(
      id,
      name.trim(),
      email,
      address,
      addressId,
      new Date(),
      new Date(),
    );

    user.addDomainEvent(
      new UserCreatedEvent(
        user.getId().getValue(),
        name.trim(),
        email.getValue(),
        address,
      ),
    );

    return user;
  }

  static fromPersistence(
    id: string,
    name: string,
    email: string,
    addressId: string,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    // For persistence, we only store the addressId
    // The Address value object will be loaded separately when needed
    const address = Address.create('', '', '', ''); // Placeholder, will be loaded from repository
    
    return new User(
      new UserId(id),
      name,
      new Email(email),
      address,
      addressId,
      createdAt,
      updatedAt,
    );
  }

  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getAddress(): Address {
    return this.address;
  }

  getAddressId(): string {
    return this.addressId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  updateEmail(email: string): void {
    this.email = new Email(email);
    this.updatedAt = new Date();
  }

  updateAddress(address: Address): void {
    this.address = address;
    this.updatedAt = new Date();
  }

  getAccountAge(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
