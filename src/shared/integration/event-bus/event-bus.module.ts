import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NestEventBusAdapter } from './nest-event-bus.adapter';
import { DomainEventBus, DOMAIN_EVENT_BUS } from './domain-event-bus.interface';

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: DOMAIN_EVENT_BUS,
      useClass: NestEventBusAdapter,
    },
  ],
  exports: [DOMAIN_EVENT_BUS],
})
export class EventBusModule {}
