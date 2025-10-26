import { ValueObject } from '../../../../shared/domain/base/value-object';
import { randomUUID } from 'crypto';

export class UserId extends ValueObject<string> {
  constructor(value?: string) {
    super(value || randomUUID());
  }

  public static create(value?: string): UserId {
    return new UserId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: UserId): boolean {
    if (!other) return false;
    return this._value === other._value;
  }
}
