import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { type ReactNode, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { type Tokens, useStyles } from '@/theme';

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** From the caller's constants.ts, e.g. ['50%']. */
  snapPoints: (string | number)[];
  children: ReactNode;
  accessibilityLabel?: string;
};

/** @gorhom/bottom-sheet wrapper: token-themed chrome, controlled via `open`. */
export function BottomSheet({
  open,
  onClose,
  snapPoints,
  children,
  accessibilityLabel,
}: BottomSheetProps) {
  const styles = useStyles(createStyles);
  const ref = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (open) ref.current?.present();
    else ref.current?.dismiss();
  }, [open]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backdropComponent={(props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={1}
          style={[props.style, styles.backdrop]}
        />
      )}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      accessibilityLabel={accessibilityLabel}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
}

const createStyles = (tokens: Tokens) =>
  StyleSheet.create({
    backdrop: { backgroundColor: tokens.color.surface.overlay.scrim },
    background: {
      backgroundColor: tokens.color.surface.page.default,
      borderTopLeftRadius: tokens.cornerRadius.xLarge,
      borderTopRightRadius: tokens.cornerRadius.xLarge,
    },
    handle: { backgroundColor: tokens.color.surface.neutral.strong },
    content: { flex: 1, gap: tokens.spacing[16], padding: tokens.spacing[24] },
  });
