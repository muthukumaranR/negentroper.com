import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/database/schema.ts',
  out: './data/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config