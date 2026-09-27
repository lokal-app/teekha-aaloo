import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { type Theme, useStyles, useTheme } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  variant?: 'default' | 'surface';
  /** Scrollable, keyboard-aware body (forms). Data lists use FlashList instead. */
  scroll?: boolean;
  edges?: Edge[];
  /** Layout-only escape hatch, merged last onto the root. */
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_EDGES: Edge[] = ['top', 'bottom', 'left', 'right'];

/** Every screen's wrapper: safe area + status bar + themed background. */
export function Screen({
  children,
  variant = 'default',
  scroll = false,
  edges = DEFAULT_EDGES,
  style,
}: ScreenProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, variant === 'surface' && styles.surface, style]}
    >
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      {scroll ? (
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    surface: { backgroundColor: theme.colors.surface },
    content: { flex: 1 },
    scrollContent: { flexGrow: 1 },
  });
