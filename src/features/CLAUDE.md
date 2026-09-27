# features/ — isolated business code (4-of-4 or it's spine)
Admission test (ALL must hold): own domain model • terminal navigator boundary • zero spine
state read/write • deletable in one PR. Shape: api/, components/, screens/, stores?/, hooks?/,
navigator.tsx, types.ts, index.ts (the ONLY public surface). Never import another feature,
never import spine stores/screens. Spine mounts the feature only via its barrel + navigator.
Scaffold with /create-feature (it runs the admission test first).
