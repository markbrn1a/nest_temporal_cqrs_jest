import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CustomerController } from './presentation/controllers/customer.controller';
import { CreateCustomerHandler } from './application/commands/handlers/create-customer.handler';
import { GetCustomerHandler } from './application/queries/handlers/get-customer.handler';
import { ListCustomersHandler } from './application/queries/handlers/list-customers.handler';
import { PrismaCustomerRepository } from './infrastructure/adapters/prisma-customer.repository';
import { CUSTOMER_REPOSITORY } from './application/ports/customer-repository.port';
import { EventBusModule } from '../../shared/integration/event-bus/event-bus.module';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [CqrsModule, EventBusModule, PrismaModule],
  controllers: [CustomerController],
  providers: [
    CreateCustomerHandler,
    GetCustomerHandler,
    ListCustomersHandler,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomerModule {}
