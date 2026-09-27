import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorState, Screen, ToastMessage } from '@/components/ui';
import { queryClient } from '@/lib/api-client';
import { recordError } from '@/lib/crash';
import { logger } from '@/lib/logger';
import { useSettingsStore } from '@/stores/settings';
import { type Theme, ThemeProvider, useStyles } from '@/theme';

type Props = { children: ReactNode };

/** The single composition root (§A11: no provider wrappers anywhere else). */
export function Providers({ children }: Props) {
  const themeName = useSettingsStore((s) => s.themeName);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  return (
    <ThemeProvider themeName={themeName} colorScheme={colorScheme}>
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}

function AppShell({ children }: Props) {
  const styles = useStyles(createStyles);
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <ErrorBoundary FallbackComponent={RootErrorFallback} onError={handleRootError}>
                {children}
              </ErrorBoundary>
              <FlashMessage position="top" MessageComponent={ToastMessage} />
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  return (
    <Screen>
      <ErrorState
        title={t('common.errorBoundary.title')}
        message={t('common.errorBoundary.message')}
        retryLabel={t('common.errorBoundary.retry')}
        onRetry={resetErrorBoundary}
      />
    </Screen>
  );
}

function handleRootError(error: unknown) {
  logger.error('Unhandled render error', error);
  recordError(error, { boundary: 'root' });
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
  });
