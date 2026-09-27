import Constants from 'expo-constants';

import type { ClientEnvironment } from '../../env';

/**
 * @env shim: the client-safe env subset validated by /env.ts at config time and embedded in
 * app.config.ts `extra`. Import as `import { env } from '@env'`.
 */
export const env = Constants.expoConfig?.extra as ClientEnvironment;
