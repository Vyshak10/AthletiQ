import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './server/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  driver: 'postgres',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
} satisfies Config;
