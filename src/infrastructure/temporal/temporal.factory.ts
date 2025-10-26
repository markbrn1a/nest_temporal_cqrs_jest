import { FactoryProvider } from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';

export const TEMPORAL_CLIENT = Symbol('TEMPORAL_CLIENT');

export const TemporalClientFactory: FactoryProvider<Client> = {
  provide: TEMPORAL_CLIENT,
  useFactory: async () => {
    const temporalHost = process.env.TEMPORAL_HOST || 'localhost:7233';
    const temporalNamespace = process.env.TEMPORAL_NAMESPACE || 'default';

    const connection = await Connection.connect({ address: temporalHost });
    return new Client({
      namespace: temporalNamespace,
      connection,
    });
  },
  inject: [],
};

