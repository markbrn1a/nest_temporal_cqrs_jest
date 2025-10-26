import { ICommand } from '@nestjs/cqrs';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { Address } from '../../domain/value-objects/address.vo';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly id: UserId,
    public readonly name: string,
    public readonly email: Email,
    public readonly address: Address,
  ) {}
}
