import { ValueObject } from '../../../../shared/domain/base/value-object';

export class Email extends ValueObject<string> {
  constructor(value: string) {
    super(value.trim().toLowerCase());
    this.validate(value);
  }

  public static create(value: string): Email {
    return new Email(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      throw new Error('Invalid email format');
    }

    if (value.trim().length > 254) {
      throw new Error('Email cannot exceed 254 characters');
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: Email): boolean {
    if (!other) return false;
    return this._value === other._value;
  }
}
