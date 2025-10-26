import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentController } from './presentation/controllers/payment.controller';
import { CreatePaymentHandler } from './application/commands/handlers/create-payment.handler';
import { StartProcessPaymentWorkflowHandler } from './application/commands/handlers/start-process-payment-workflow.handler';
import { GetPaymentHandler } from './application/queries/handlers/get-payment.handler';
import { PrismaPaymentRepository } from './infrastructure/persistence/prisma-payment.repository';
import { PAYMENT_REPOSITORY } from './application/ports/payment-repository.port';
import { EventBusModule } from '../../shared/integration/event-bus/event-bus.module';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { TemporalModule } from '../../infrastructure/temporal/temporal.module';

@Module({
  imports: [CqrsModule, EventBusModule, PrismaModule, TemporalModule],
  controllers: [PaymentController],
  providers: [
    CreatePaymentHandler,
    StartProcessPaymentWorkflowHandler,
    GetPaymentHandler,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PrismaPaymentRepository,
    },
  ],
})
export class PaymentModule {}
