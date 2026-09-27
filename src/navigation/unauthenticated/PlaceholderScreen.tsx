// PLACEHOLDER — delete when the first real screen is registered
import { useTranslation } from 'react-i18next';

import { EmptyState, Screen } from '@/components/ui';

export function PlaceholderScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <EmptyState
        title={t('navigation.placeholder.title')}
        message={t('navigation.placeholder.message')}
      />
    </Screen>
  );
}
