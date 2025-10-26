import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OnboardingSaga } from './sagas/onboarding.saga';

@Module({
  imports: [CqrsModule],
  providers: [
    OnboardingSaga,
  ],
  exports: [
    OnboardingSaga,
  ],
})
export class IntegrationModule {}
