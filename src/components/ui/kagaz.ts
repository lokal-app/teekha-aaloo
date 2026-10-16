// Shared Kagaz — explicit, 1:1, pass-through re-exports (§A7.8). Register an export here the first
// time the app uses it. Never JSX, styles, defaults or aliases in this file.
export {
  Button,
  type ButtonProps,
  FloatingSnackbar,
  type FloatingSnackbarProps,
  type FloatingSnackbarState,
  type IconProps,
  type IconSlot,
  renderIconSlot,
  type Space,
  Spinner,
  Text,
  type TextProps,
  VStack,
} from '@lokal-app/kagaz-components';
