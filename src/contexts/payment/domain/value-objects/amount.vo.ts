import { ValueObject } from '../../../../shared/domain/base/value-object';

export class Amount extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  public static create(value: number): Amount {
    if (value <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (value > 1000000) {
      throw new Error('Amount cannot exceed 1,000,000');
    }
    return new Amount(value);
  }

  public getValue(): number {
    return this._value;
  }

  public add(other: Amount): Amount {
    return Amount.create(this._value + other._value);
  }

  public subtract(other: Amount): Amount {
    const result = this._value - other._value;
    if (result < 0) {
      throw new Error('Cannot subtract amount that would result in negative value');
    }
    return Amount.create(result);
  }
}
