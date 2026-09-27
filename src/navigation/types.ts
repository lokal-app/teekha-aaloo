import type { AuthenticatedStackParamList } from './authenticated/types';
import type { UnauthenticatedStackParamList } from './unauthenticated/types';

/** Only one stack is mounted at a time (three-state root), so the root list is their union. */
export type RootParamList = UnauthenticatedStackParamList & AuthenticatedStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends UnauthenticatedStackParamList, AuthenticatedStackParamList {}
  }
}
