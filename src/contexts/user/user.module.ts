import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from './presentation/controllers/user.controller';
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { GetUserHandler } from './application/queries/handlers/get-user.handler';
import { ListUsersHandler } from './application/queries/handlers/list-users.handler';
import { PrismaUserRepository } from './infrastructure/adapters/prisma-user.repository';
import { USER_REPOSITORY } from './application/ports/user-repository.port';
import { EventBusModule } from '../../shared/integration/event-bus/event-bus.module';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { CreateUserWithAddressHandler } from './application/commands/handlers/create-user-with-address.handler';
import { PrismaUnitOfWork } from '../../infrastructure/database/unit-of-work/prisma-unit-of-work';
import { UNIT_OF_WORK } from '../../infrastructure/database/unit-of-work/unit-of-work.interface';
@Module({
  imports: [CqrsModule, EventBusModule, PrismaModule],
  controllers: [UserController],
  providers: [
    CreateUserHandler,
    GetUserHandler,
    CreateUserHandler,
    CreateUserWithAddressHandler,
    ListUsersHandler,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: UNIT_OF_WORK,
      useClass: PrismaUnitOfWork,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
