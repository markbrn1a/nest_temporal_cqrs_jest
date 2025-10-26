import { ValueObject } from '../../../../shared/domain/base/value-object';

export class Phone extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): Phone {
    if (!value || value.trim().length === 0) {
      throw new Error('Phone cannot be empty');
    }


    return new Phone(value);
  }

  public getValue(): string {
    return this._value;
  }
}
