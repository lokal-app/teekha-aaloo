import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { Button, type IconSlot, renderIconSlot, Text, VStack } from '@/components/ui';
import { type Tokens, useStyles, useTokens } from '@/theme';

export type EmptyStateProps = {
  title: string;
  message?: string;
  /** An icon component (e.g. a Kagaz icon), drawn at iconSize.2xLarge in icon.neutral.strong. */
  icon?: IconSlot;
  actionLabel?: string;
  onAction?: () => void;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

/** The 'empty' branch of every data screen. */
export function EmptyState({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const styles = useStyles(createStyles);
  const tokens = useTokens();
  return (
    <VStack align="center" justify="center" gap={12} padding={24} style={[styles.root, style]}>
      {renderIconSlot(icon, {
        color: tokens.color.icon.neutral.strong,
        size: tokens.iconSize['2xLarge'],
      })}
      <Text variant="title4" color="text.neutral.intense" style={styles.centred}>
        {title}
      </Text>
      {message ? (
        <Text variant="body2" color="text.neutral.strong" style={styles.centred}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </VStack>
  );
}

const createStyles = (_tokens: Tokens) =>
  StyleSheet.create({
    root: { flex: 1 },
    centred: { textAlign: 'center' },
  });
