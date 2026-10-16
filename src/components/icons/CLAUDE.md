# components/icons/ — app icons Kagaz doesn't ship

Check first: Kagaz icons (@lokal-app/kagaz-components) and the brand's icons
(@lokal-app/kagaz-brand-<brand>/icons, e.g. CoinIcon). Only if neither has it: <Name>Icon.tsx here, generated
from the Figma Phosphor component (react-native-svg, viewBox from Figma, single fill={color}),
implementing Kagaz IconProps { color?: string; size: number; testID?: string }, named export,
registered in index.ts. Callers pass a tokens.color.icon.* colour and a tokens.iconSize.* size;
pass icons to Kagaz slots as components (icon={RupeeIcon}) so the slot colours them per state.
No icon fonts, no @expo/vector-icons, no PNG icons. A generic icon many apps need → ask Kagaz.
