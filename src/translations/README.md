# src/translations/ — i18n resources

**Goes here:** one JSON per language (`en.json` shipped; `hi.json`, … added as TODO siblings).
Keys are namespaced `<area>.<screen-or-component>.<key>` (e.g. `auth.login.submitCta`) (§A4).
**Rules:** every user-facing string goes through `t()` (§A10 #2); `components/ui` never calls
`t()` — text arrives via props. Keys are added by `/create-screen` alongside the screen.
Loaded by `lib/i18n` (typed keys via `CustomTypeOptions`).
