# assets/ — static assets

| Folder | Contents | Conventions |
|---|---|---|
| `fonts/` | font files (`.ttf`/`.otf`) | `<Family>-<Weight>.ttf`; families referenced ONLY from `src/theme/tokens/typography.ts`; loaded in the §A13 "load fonts" slot |
| `bootsplash/` | splash artwork | wired via app.config.ts once the bootsplash slot is filled |
| `animations/` | Lottie/Rive files | kebab-case names |
| root | `icon.png`, `android-icon-*.png` | app icons referenced by `app.config.ts` |

Import from code via the `@assets/*` alias. Images render only through `expo-image`.
Assets are design deliverables — names mirror the Figma export.
