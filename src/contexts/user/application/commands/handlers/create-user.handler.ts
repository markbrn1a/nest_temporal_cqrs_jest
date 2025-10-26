import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { CreateUserCommand } from '../create-user.command';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { type UserRepositoryPort, USER_REPOSITORY } from '../../ports/user-repository.port';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import {type DomainEventBus, DOMAIN_EVENT_BUS } from '../../../../../shared/integration/event-bus/domain-event-bus.interface';
import { UNIT_OF_WORK, type UnitOfWork } from '../../../../../infrastructure/database/unit-of-work/unit-of-work.interface';
import { PrismaUserRepository } from '../../../infrastructure/adapters/prisma-user.repository';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(DOMAIN_EVENT_BUS)
    private readonly domainEventBus: DomainEventBus,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { id, name, email, address } = command;

    // Use Unit of Work for transaction
    return await this.unitOfWork.execute(async (uow) => {
      // Create repository with transaction context
      const userRepository = new PrismaUserRepository(uow.transaction);
      
      // Check if user with this email already exists (business rule)
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserAlreadyExistsException(email.getValue());
      }

      // Create new user (domain logic with events)
      const user = User.create(id, name, email, address);

      // Persist the user within transaction
      await userRepository.save(user);

      // Publish domain events after successful transaction
      await this.domainEventBus.publishAll(user.pullDomainEvents());

      return user;
    });
  }
}
