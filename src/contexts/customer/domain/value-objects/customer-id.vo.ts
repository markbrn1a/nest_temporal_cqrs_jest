import { ValueObject } from '../../../../shared/domain/base/value-object';
import { randomUUID } from 'crypto';

export class CustomerId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(value?: string): CustomerId {
    if (!value) {
      value = randomUUID();
    }
    
    if (!value || value.trim().length === 0) {
      throw new Error('CustomerId cannot be empty');
    }

    return new CustomerId(value);
  }

  public getValue(): string {
    return this._value;
  }
}
