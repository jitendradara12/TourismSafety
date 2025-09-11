import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgres://postgres:postgres@localhost:5432/sih'),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);