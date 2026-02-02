# Conventions de travail (Git)

Ce document formalise des conventions simples, cohérentes et pédagogiques.

## Branches

- `main` : branche stable / livrable
- `dev` : intégration
- `feature/<sujet-court>` : développement (ex: `feature/auth-api`)
- `fix/<sujet-court>` : correction (ex: `fix/login-form`)

## Commits (format conseillé)

Format recommandé (simple et lisible) :

- `feat(frontend): ...`
- `feat(backend): ...`
- `fix(frontend): ...`
- `fix(backend): ...`
- `chore: ...` (setup, deps, config)
- `docs: ...`

Exemples :

- `chore: setup monorepo workspaces`
- `feat(frontend): écran recherche (UX)`
- `feat(backend): endpoints listings (public)`

## Règle

- Petits commits, messages explicites.
- Pas d'implémentation hors périmètre du cahier des charges.
