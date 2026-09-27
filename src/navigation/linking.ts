import { env } from '@env';
import type { LinkingOptions } from '@react-navigation/native';

import type { RootParamList } from './types';

/** Deep-link config: add `screens` entries as routes are registered. */
export const linking: LinkingOptions<RootParamList> = {
  prefixes: [`${env.SCHEME}://`],
  config: {
    screens: {},
  },
};
