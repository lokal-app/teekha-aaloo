import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootParamList } from './types';

/** The ONLY way to navigate outside React (push-open handlers, etc.). */
export const navigationRef = createNavigationContainerRef<RootParamList>();
