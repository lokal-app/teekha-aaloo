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

import { ErrorState, Screen, ToastMessage } from '@/components/shell';
import { queryClient } from '@/lib/api-client';
import { recordError } from '@/lib/crash';
import { logger } from '@/lib/logger';
import { useSettingsStore } from '@/stores/settings';
import { DEFAULT_THEME, type ThemeName, ThemeProvider, themes } from '@/theme';

type Props = { children: ReactNode };

/**
 * The single composition root (§A13 order, §A11: no provider wrappers anywhere else). The Kagaz
 * ThemeProvider sits inside the native/infra providers and wraps everything that renders Kagaz.
 */
export function Providers({ children }: Props) {
  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <KagazTheme>
              <BottomSheetModalProvider>
                <ErrorBoundary FallbackComponent={RootErrorFallback} onError={handleRootError}>
                  {children}
                </ErrorBoundary>
                <FlashMessage position="top" MessageComponent={ToastMessage} />
              </BottomSheetModalProvider>
            </KagazTheme>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function isThemeName(name: string): name is ThemeName {
  return Object.prototype.hasOwnProperty.call(themes, name);
}

/** settings.colorScheme → Kagaz ThemeProvider: brand = brand default mode, system = follow device. */
function KagazTheme({ children }: Props) {
  const themeName = useSettingsStore((s) => s.themeName);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const theme = themes[isThemeName(themeName) ? themeName : DEFAULT_THEME];
  return (
    <ThemeProvider
      theme={theme}
      followSystem={colorScheme === 'system'}
      mode={colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : undefined}
    >
      {children}
    </ThemeProvider>
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
