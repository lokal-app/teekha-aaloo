import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

import { z } from 'zod';

// Build-time only: evaluated by app.config.ts in Node. The app reads the client
// subset at runtime through src/lib/env.ts (@env), never this file.

const APP_ENVS = ['development', 'staging', 'production'] as const;
export type AppEnv = (typeof APP_ENVS)[number];

const APP_ENV = z.enum(APP_ENVS).parse(process.env.APP_ENV ?? 'development');

const BASE_NAME = 'Teekha Aaloo';
const BASE_SCHEME = 'teekhaaaloo';
const BASE_BUNDLE_ID = 'com.lokal.teekhaaaloo';
const BASE_PACKAGE = 'com.lokal.teekhaaaloo';
const SLUG = 'teekha-aaloo';
// TODO(eas): set the Expo account owner and EAS project id once the EAS project exists.
const EXPO_ACCOUNT_OWNER = '';
const EAS_PROJECT_ID = '';

const NAME_SUFFIX: Record<AppEnv, string> = {
  development: ' (Dev)',
  staging: ' (Staging)',
  production: '',
};

function withEnvSuffix(base: string) {
  return APP_ENV === 'production' ? base : `${base}.${APP_ENV}`;
}

// File values win over inherited process.env: Expo CLI pre-loads .env.<NODE_ENV>,
// which would otherwise leak production values into a staging release build.
function loadEnvFile(): Record<string, string | undefined> {
  const file = path.resolve(process.cwd(), `.env.${APP_ENV}`);
  const fromFile = fs.existsSync(file) ? parseEnv(fs.readFileSync(file, 'utf8')) : {};
  return { ...process.env, ...fromFile };
}

const raw = loadEnvFile();

const clientSchema = z.object({
  APP_ENV: z.enum(APP_ENVS),
  NAME: z.string().min(1),
  SCHEME: z.string().min(1),
  BUNDLE_ID: z.string().min(1),
  PACKAGE: z.string().min(1),
  VERSION: z.string().min(1),
  API_URL: z.url(),
});

const buildTimeSchema = z.object({
  EXPO_ACCOUNT_OWNER: z.string(),
  EAS_PROJECT_ID: z.string(),
  SLUG: z.string().min(1),
});

export type ClientEnvironment = z.infer<typeof clientSchema>;
export type BuildTimeEnvironment = z.infer<typeof buildTimeSchema>;

const clientInput = {
  APP_ENV,
  NAME: `${BASE_NAME}${NAME_SUFFIX[APP_ENV]}`,
  SCHEME: BASE_SCHEME,
  BUNDLE_ID: withEnvSuffix(BASE_BUNDLE_ID),
  PACKAGE: withEnvSuffix(BASE_PACKAGE),
  VERSION: '1.0.0',
  API_URL: raw.API_URL,
};

const buildTimeInput = {
  EXPO_ACCOUNT_OWNER,
  EAS_PROJECT_ID: raw.EAS_PROJECT_ID ?? EAS_PROJECT_ID,
  SLUG,
};

function parseOrExit<T extends z.ZodType>(schema: T, input: unknown, label: string): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `Invalid ${label} environment for APP_ENV=${APP_ENV} (.env.${APP_ENV}):\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

export const ClientEnv = parseOrExit(clientSchema, clientInput, 'client');
export const BuildTimeEnv = parseOrExit(buildTimeSchema, buildTimeInput, 'build-time');
