# components/ — presentational only
ui/ = atomic design-system primitives (own CLAUDE.md). <area>/ = shared by ≥2 screens of one
area. common/ = cross-area business components. NOTHING here fetches data, reads stores, or
navigates — data arrives via props, events leave via callbacks. No screen-specific components
here (those live inside the screen folder). Styling per the absolute createStyles pattern.
