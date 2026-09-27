---
description: Run the 4-of-4 features/ admission test and scaffold features/<name>/ if it
  passes (redirect to spine if not). Use whenever someone proposes "a new feature module".
argument-hint: "<feature-name> <one-line description>"
allowed-tools: "Read Write Edit Grep Glob Bash Agent"
---
1. Spawn architecture-guard with the feature description for the 4-of-4 test (own domain •
   terminal navigator • no spine state • deletable in one PR). Show the verdict to the user.
2. FAIL any criterion → do NOT scaffold; output the spine placement plan instead
   (api/<resource>/, screens/<area>/, stores/<area>/) and offer the spine skills.
3. PASS → scaffold features/<name>/: navigator.tsx (terminal stack), types.ts, index.ts
   (exports navigator + minimal API), empty api/ components/ screens/ with .gitkeep.
4. Mount: add one typed route in AuthenticatedStack rendering the feature navigator via the
   barrel. 5. Gate: pnpm lint + pnpm type-check. Hand off detail work to feature-builder.
