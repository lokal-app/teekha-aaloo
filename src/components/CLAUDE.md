# components/ — app compositions of Kagaz (presentational only)

Kagaz is the design system. ui/ = the Kagaz GATEWAY (own CLAUDE.md): pass-through re-exports,
the only importer of @lokal-app/kagaz-*; everything here imports Kagaz from @/components/ui.
shell/ = the CLOSED six app-shell pieces (own CLAUDE.md). icons/ = app icons Kagaz lacks (own
CLAUDE.md). <area>/ = shared by ≥2 screens of one area. common/ = cross-area business components.
Every component here composes Kagaz (shared components, primitives, and this app's brand
/components) and carries THIS app's business meaning (BookingCard, OrderSummary). Forbidden:
re-creating, wrapping, re-exporting or restyling a Kagaz component (shared or brand); naming a
component like a Kagaz export; components/ui/; a brand-unique design-system component (it belongs
in @lokal-app/kagaz-brand-<brand>/components). Kagaz lacks something → Kagaz gap protocol
(docs/ARCHITECTURE.md §A7.7): // KAGAZ-GAP(<url>) + docs/kagaz-gaps.md row.
NOTHING here fetches data, reads stores, or navigates — data arrives via props, events leave
via callbacks. No screen-specific components here (those live inside the screen folder).
Styling per the absolute pattern: Kagaz props → primitives' token props → createStyles(tokens).
