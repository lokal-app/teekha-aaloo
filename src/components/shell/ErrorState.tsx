import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

import { Button, Text, VStack } from '@/components/ui';
import { type Tokens, useStyles } from '@/theme';

export type ErrorStateProps = {
  title: string;
  message?: string;
  retryLabel: string;
  onRetry: () => void;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

/** The 'error' branch of every data screen: message + retry(). */
export function ErrorState({ title, message, retryLabel, onRetry, style }: ErrorStateProps) {
  const styles = useStyles(createStyles);
  return (
    <VStack
      role="alert"
      align="center"
      justify="center"
      gap={12}
      padding={24}
      style={[styles.root, style]}
    >
      <Text variant="title4" color="text.neutral.intense" style={styles.centred}>
        {title}
      </Text>
      {message ? (
        <Text variant="body2" color="text.neutral.strong" style={styles.centred}>
          {message}
        </Text>
      ) : null}
      <Button label={retryLabel} onPress={onRetry} variant="outlined" />
    </VStack>
  );
}

const createStyles = (_tokens: Tokens) =>
  StyleSheet.create({
    root: { flex: 1 },
    centred: { textAlign: 'center' },
  });
