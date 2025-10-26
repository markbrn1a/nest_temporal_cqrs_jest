import { AggregateRoot } from '../../../../shared/domain/base/aggregate-root';
import { PaymentId } from '../value-objects/payment-id.vo';
import { Amount } from '../value-objects/amount.vo';
import { PaymentCreatedEvent } from '../events/payment-created.event';
import { PaymentCompletedEvent } from '../events/payment-completed.event';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Payment extends AggregateRoot {
  private constructor(
    private readonly _id: PaymentId,
    private readonly _userId: string,
    private readonly _customerId: string,
    private readonly _amount: Amount,
    private _status: PaymentStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  public static create(
    id: PaymentId,
    userId: string,
    customerId: string,
    amount: Amount,
  ): Payment {
    const payment = new Payment(
      id,
      userId,
      customerId,
      amount,
      PaymentStatus.PENDING,
      new Date(),
      new Date(),
    );

    payment.addDomainEvent(new PaymentCreatedEvent(
      id.getValue(),
      userId,
      customerId,
      amount.getValue(),
    ));

    return payment;
  }

  public static fromPersistence(
    id: PaymentId,
    userId: string,
    customerId: string,
    amount: Amount,
    status: PaymentStatus,
    createdAt: Date,
    updatedAt: Date,
  ): Payment {
    return new Payment(
      id,
      userId,
      customerId,
      amount,
      status,
      createdAt,
      updatedAt,
    );
  }

  public getId(): PaymentId {
    return this._id;
  }

  public getUserId(): string {
    return this._userId;
  }

  public getCustomerId(): string {
    return this._customerId;
  }

  public getAmount(): Amount {
    return this._amount;
  }

  public getStatus(): PaymentStatus {
    return this._status;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  public complete(): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be completed');
    }
    
    this._status = PaymentStatus.COMPLETED;
    this._updatedAt = new Date();
    
    this.addDomainEvent(new PaymentCompletedEvent(
      this._id.getValue(),
      this._userId,
      this._customerId,
      this._amount.getValue(),
    ));
  }

  public fail(): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be failed');
    }
    
    this._status = PaymentStatus.FAILED;
    this._updatedAt = new Date();
  }
}
