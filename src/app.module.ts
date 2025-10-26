import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from './contexts/user/user.module';
import { CustomerModule } from './contexts/customer/customer.module';
import { OnboardingModule } from './contexts/onboarding/onboarding.module';
import { PaymentModule } from './contexts/payment/payment.module';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { IntegrationModule } from './shared/integration/integration.module';
import { TemporalModule } from './infrastructure/temporal/temporal.module';
import { TemporalWorkerModule } from './infrastructure/temporal/worker/temporal-worker.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    CqrsModule.forRoot(),
    PrismaModule,
    UserModule,
    CustomerModule,
    OnboardingModule,
    PaymentModule,
    IntegrationModule,
    TemporalModule,
    TemporalWorkerModule, // Import worker module last to ensure DI is ready
  ],
  controllers: [HealthController],
})
export class AppModule {}
