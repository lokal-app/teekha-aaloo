# src/components/common/ — cross-area business components

**Goes here:** components with business meaning used in ≥2 areas (e.g. a `UserAvatarRow`), composed
from Kagaz via `@/components/ui`, and temporary `KAGAZ-GAP` compositions (with a docs/kagaz-gaps.md row).
**Does NOT:** anything Kagaz ships (→ import it), brand-unique design-system pieces (→ a Kagaz gap for
kagaz-brand-gaming), single-area or single-screen components. No data fetching, no stores — props only.
**Shape:** `<Name>.tsx`, named export, in-file `createStyles(tokens)` tail. No `index.ts`.
Scaffold with `/create-component <Name> common`.
