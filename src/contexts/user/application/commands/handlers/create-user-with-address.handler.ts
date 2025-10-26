import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateUserWithAddressCommand } from '../create-user-with-address.command';
import { CreateUserCommand } from '../create-user.command';
import { Address } from '../../../domain/value-objects/address.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Email } from '../../../domain/value-objects/email.vo';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
@CommandHandler(CreateUserWithAddressCommand)
export class CreateUserWithAddressHandler implements ICommandHandler<CreateUserWithAddressCommand> {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CreateUserWithAddressCommand): Promise<{ message: string; status: string }> {
    const { name, email, address } = command;

    try {
      // Create Address value object
      const addressVO = Address.create(
        address.street,
        address.city,
        address.zipCode,
        address.country,
      );

      // Create user with address using the Unit of Work pattern
      const createUserCommand = new CreateUserCommand(
        UserId.create(),
        name,
        Email.create(email),
        addressVO,
      );
      const user = await this.commandBus.execute(createUserCommand);

      return {
        message: 'User with address created successfully',
        status: 'completed',
      };
    } catch (error) {
      console.error('Failed to create user with address:', error);
      throw new Error(`Failed to create user with address: ${error.message}`);
    }
  }
}
