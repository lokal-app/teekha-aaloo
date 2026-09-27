import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { type ReactNode, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { type Theme, useStyles } from '@/theme';

import { type BottomSheetSize, SNAP_POINTS } from './snapPoints';

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  size?: BottomSheetSize;
  children: ReactNode;
  accessibilityLabel?: string;
};

function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );
}

/** @gorhom/bottom-sheet wrapper: token-themed chrome, fixed size API, controlled via `open`. */
export function BottomSheet({
  open,
  onClose,
  size = 'md',
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
      snapPoints={[...SNAP_POINTS[size]]}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      accessibilityLabel={accessibilityLabel}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    background: {
      backgroundColor: theme.colors.surfaceElevated,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
    },
    handle: { backgroundColor: theme.colors.border },
    content: { flex: 1, gap: theme.spacing.md, padding: theme.spacing.lg },
  });
