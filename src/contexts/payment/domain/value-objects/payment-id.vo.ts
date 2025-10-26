import { ValueObject } from '../../../../shared/domain/base/value-object';

export class PaymentId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(value?: string): PaymentId {
    if (!value) {
      value = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return new PaymentId(value);
  }

  public getValue(): string {
    return this._value;
  }
}
