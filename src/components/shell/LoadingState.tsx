import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { Spinner } from '@/components/ui';
import { type Tokens, useStyles, useTokens } from '@/theme';

export type LoadingStateProps = {
  /** Spoken while loading (translated by the caller). */
  accessibilityLabel?: string;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

/** The 'loading' branch of every data screen. */
export function LoadingState({ accessibilityLabel, style }: LoadingStateProps) {
  const styles = useStyles(createStyles);
  const tokens = useTokens();
  return (
    <View
      role="progressbar"
      aria-busy
      accessibilityLabel={accessibilityLabel}
      style={[styles.root, style]}
    >
      <Spinner color={tokens.color.icon.neutral.strong} size={tokens.iconSize.xLarge} />
    </View>
  );
}

const createStyles = (tokens: Tokens) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: tokens.spacing[24] },
  });
