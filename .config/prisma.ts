import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: '../src/infrastructure/database/schema.prisma',
  migrations: {
    path: '../src/infrastructure/database/migrations',
  },
  engine: 'classic',
  datasource: {
    url: 'file:./dev.db',
  },
});
