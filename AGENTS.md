# AGENTS.md — groceries-client

---

# 🚨 Repository Operating Rules (MANDATORY)

These rules extend the root AGENTS.md and must be followed.

## Priority Order
1. Active Spec (if present)
2. Root AGENTS.md
3. This file

## Core Rules
- You MUST follow the active spec exactly
- Do NOT expand or reinterpret scope
- Do NOT read additional files unless required by the spec
- Do NOT refactor unrelated code
- Do NOT introduce new abstractions unless explicitly required

---

## Execution Modes

### PLAN MODE
- Identify exact files within this repository
- Do NOT modify files

### PATCH MODE
- Modify ONLY files listed in the spec
- Execute steps exactly as written
- Do NOT add, remove, or reorder steps
- If a step is unclear: STOP and ask (do not infer)

---

## 📄 Spec Integration

- All non-trivial work must be driven by a spec in `/specs/`
- This repository executes ONLY its portion of the spec
- Ignore spec steps for other repositories unless instructed

### File Scope Enforcement
- Only modify files explicitly listed in the spec
- If additional files seem required:
  - STOP
  - ASK before proceeding

---

## 🔒 Change Boundaries

- Do NOT modify:
  - Unrelated components
  - Styling outside task scope
  - Global utilities unless specified
- Do NOT rename or move files unless specified
- Do NOT update tests unless required by the spec

---

## ⚡ Performance Guard

- Do NOT introduce unnecessary re-renders
- Do NOT add memoization/hooks unless required
- Prefer existing patterns over new optimizations

---

## 🌐 API Change Rules

- Do NOT change API request/response shapes
- Do NOT modify `src/utils/api.ts` unless specified
- If API mismatch is detected:
  - STOP
  - Report in PLAN MODE

---

## Build / Lint / Test Commands

```bash
npm start                    # Dev server (CRA + craco)
npm run build:production     # Production build
npm run build:staging        # Staging build (uses .env.staging)
npm run lint                 # ESLint: eslint --ext .ts,.tsx src/
npm run format               # Prettier: prettier --write 'src/**/*.{ts,tsx,json,css,md}'
npm run test                 # Jest in watch mode (craco test)
npm run test:ci              # tsc --noEmit && lint && CI=true test --coverage
```

---

## Single Test

```bash
npx craco test -- --testPathPattern="path/to/file.spec" --watchAll=false
```

---

## Required After Changes (PATCH MODE)

```bash
npm run format && npx tsc --noEmit && npm run lint
```

* Do NOT run full test suite unless specified in the spec
* Do NOT introduce additional commands

---

## Tech Stack

* React 19, TypeScript (strict), React Router v7
* SCSS + Bootstrap 5 + react-bootstrap
* Axios (`src/utils/api.ts`)
* Jest + React Testing Library + userEvent
* CRA 5 via craco

---

## Project Structure

```
src/
├── components/         # Reusable UI components
├── routes/             # Route-level page components
├── utils/              # Utility functions (api, auth, format, etc.)
├── typings/            # TypeScript interfaces and enums
├── hooks/              # Custom React hooks
├── test-utils/         # Test helpers and factories
├── styles/             # SCSS stylesheets
└── setupTests.ts       # Global Jest setup and mocks
```

---

## Code Style

### TypeScript

* Strict mode enabled
* No `any`
* Explicit return types required
* Interfaces over type aliases
* Use `import type` for types
* Absolute imports from `src/`

### Naming

* Components: PascalCase
* Utilities: camelCase
* Interfaces: `I*`
* Enums: `E*`
* Types: `T*`
* Tests: `*.spec.ts(x)`

### Formatting

* Max line length: 120
* 2 spaces
* Curly braces required
* No console statements

### Patterns

* Destructured params required
* Optional chaining preferred

---

## Components

* Functional components only
* Named exports preferred (default for pages)
* Props interfaces required
* Return type: `React.JSX.Element`

---

## State & Auth

* `UserContext` (AppRouter)
* Session storage: `access-token`, `client`, `uid`
* Axios interceptors manage auth

---

## Testing

### Modification Rules

* Only modify tests if required by the spec
* Do NOT update snapshots unless specified
* Do NOT expand test scope

### Conventions

* Use `data-test-id`
* `userEvent` (not `fireEvent`)
* `findBy*` (async), `getBy*` (sync), `queryBy*` (absence)

### Coverage

* ~99% required
* Excludes: `AppRouter.tsx`, `index.tsx`, `test-utils/`

---

## Environment Variables

* `REACT_APP_API_BASE`
* `REACT_APP_VERSION`

---

## Code Review Checklist

* TypeScript strict compliance
* Lint + format pass
* Tests included
* Correct naming conventions
* Proper error handling (`handleFailure`)
* Uses `userEvent`
* Uses `data-test-id`

---

## Do NOT

* Add comments unless asked
* Use `console.log`
* Use `any`
* Create class components
* Modify database/migrations
* Commit changes unless instructed
