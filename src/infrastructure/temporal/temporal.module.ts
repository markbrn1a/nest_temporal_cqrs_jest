import {
  Module,
  Global,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TemporalService } from './temporal.service';
import {
  TemporalClientFactory,
  TEMPORAL_CLIENT,
} from './temporal.factory';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    TemporalClientFactory,
    TemporalService,
 
  ],
  exports: [TEMPORAL_CLIENT, TemporalService],
})
export class TemporalModule {}
