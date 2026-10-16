import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Space, VStack } from '@/components/ui';
import { type Tokens, useStyles, useTheme } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  /** Scrollable, keyboard-aware body (forms). Data lists use FlashList instead. */
  scroll?: boolean;
  /** Content padding from the spacing scale. */
  padding?: Space;
  /** Gap between children from the spacing scale. */
  gap?: Space;
  /** false inside the tab navigator: the Kagaz tab bar already holds the home-indicator space. */
  insetBottom?: boolean;
  /** Layout-only escape hatch, merged last onto the root. */
  style?: StyleProp<ViewStyle>;
};

/** Every screen's wrapper: safe area, page background, status bar, keyboard-aware scrolling. */
export function Screen({
  children,
  scroll = false,
  padding,
  gap,
  insetBottom = true,
  style,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { mode, tokens } = useTheme();
  const styles = useStyles(createStyles, {
    top: insets.top,
    bottom: insetBottom ? insets.bottom : 0,
  });
  const body = (
    <VStack padding={padding} gap={gap} style={styles.content}>
      {children}
    </VStack>
  );
  return (
    <View style={[styles.root, style]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {scroll ? (
        <KeyboardAwareScrollView
          bottomOffset={tokens.spacing[48]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {body}
        </KeyboardAwareScrollView>
      ) : (
        body
      )}
    </View>
  );
}

type StyleParams = { top: number; bottom: number };

const createStyles = (tokens: Tokens, { top, bottom }: StyleParams) =>
  StyleSheet.create({
    root: {
      flex: 1,
      paddingTop: top,
      paddingBottom: bottom,
      backgroundColor: tokens.color.surface.page.default,
    },
    content: { flex: 1 },
    scrollContent: { flexGrow: 1 },
  });
