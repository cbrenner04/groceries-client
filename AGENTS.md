# AGENTS.md — Agentic Coding Guide for groceries-client

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

### Running a single test

```bash
npx craco test -- --testPathPattern="path/to/file.spec" --watchAll=false
```

Example: `npx craco test -- --testPathPattern="src/utils/format.spec" --watchAll=false`

### After making changes, always run

```bash
tsc --noEmit && npm run lint
```

## Tech Stack

- React 19, TypeScript (strict), React Router v7
- Styling: SCSS + Bootstrap 5 + react-bootstrap
- HTTP: Axios (see `src/utils/api.ts`)
- Testing: Jest + React Testing Library + userEvent
- Build: CRA 5 via craco (`craco.config.js`)

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

## Code Style

### TypeScript

- **Strict mode** is on (`strict: true`, `noImplicitAny: true`)
- `baseUrl` is `./src` — use absolute imports from `src/` (e.g., `import api from 'utils/api'`)
- **No `any`** — `@typescript-eslint/no-explicit-any: error`
- **Explicit return types** on all functions and module boundaries
- **No inferrable types** — don't annotate what TS can infer (e.g., `const x = 5` not `const x: number = 5`)
- **Consistent type imports** — use `import type { Foo }` for type-only imports
- **Semicolons required**
- **Interfaces over type aliases** — enforced via `consistent-type-definitions: ["error", "interface"]`
- Interface member delimiter: semicolons (e.g., `{ name: string; age: number; }`)

### Naming Conventions

- **Components/files:** PascalCase (`AppNav.tsx`, `EditListItem.tsx`)
- **Utility files:** camelCase (`format.ts`, `handleFailure.ts`)
- **Interfaces:** prefix with `I` (`IList`, `IListItem`, `IConfirmModalProps`)
- **Enums:** prefix with `E` (`EListType`, `EUserPermissions`)
- **Type aliases:** prefix with `T` (`TUserPermissions`)
- **Variables:** camelCase, UPPER_CASE, or PascalCase (enforced by `naming-convention` rule)
- **Test files:** `ComponentName.spec.tsx` or `utilName.spec.ts`

### Formatting

- Max line length: **120 characters**
- Indentation: **2 spaces**
- Curly braces required for all control structures (`curly: ["error", "all"]`)
- No console statements (`no-console: error`)
- Prettier handles formatting (`eslint-config-prettier` disables conflicting rules)

### Imports

- Use **absolute imports** from `src/` base (e.g., `import { IList } from 'typings'`)
- Use `import type` for type-only imports (enforced)
- Prefer **optional chaining** (`@typescript-eslint/prefer-optional-chain: error`)

### Destructuring

- **Required** in function parameters — max 0 non-destructured params
- Use destructured object params: `function foo({ a, b }: IParams)` not `function foo(a: string, b: number)`

### Error Handling

- API errors use `handleFailure` from `utils/handleFailure` — handles 401/403/404/network errors
- Toast notifications via `utils/toast` (`showToast.error()`, `.success()`, `.info()`, `.warning()`)
- Never swallow errors silently; always inform the user

### Components

- **Functional components only** — no class components
- Named exports preferred; default exports used for page-level components
- Props interfaces defined per-component (e.g., `IConfirmModalProps`)
- Use `React.JSX.Element` as return type

```typescript
interface IComponentProps {
  name: string;
  onSave: () => void;
}

export default function ComponentName({ name, onSave }: IComponentProps): React.JSX.Element {
  // implementation
}
```

### State & Auth

- Global user state via `UserContext` (in `AppRouter.tsx`)
- Session storage for auth tokens: `{ 'access-token', client, uid }`
- Axios interceptors auto-attach auth headers and refresh tokens

## Testing

### Conventions

- Test ID attribute: `data-test-id` (configured in `setupTests.ts`)
- Use `setup()` pattern returning `{ props, user, ...renderResult }`
- `userEvent.setup()` for interactions (not `fireEvent`)
- `findBy*` for async, `getBy*` for sync, `queryBy*` to assert absence
- Snapshots for UI regression (`toMatchSnapshot()`)
- `jest.fn()` for mocks; `jest.spyOn` for spying

### Coverage

Coverage thresholds are very high (~99%+). All new code needs tests.

Excluded from coverage: `AppRouter.tsx`, `index.tsx`, `test-utils/`

### Global Mocks (in setupTests.ts)

- `axios` — fully mocked with default responses
- `react-toastify` — mocked toast functions
- `utils/toast` — mocked `showToast` object
- `react-idle-timer` — mocked `useIdleTimer`
- `moment` — pinned to `2020-05-24T10:00:00.000Z` when called without args

### Test File Template

```typescript
import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Component, { type IComponentProps } from './Component';

interface ISetupReturn extends RenderResult {
  props: IComponentProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IComponentProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IComponentProps = {
    // defaults
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Component {...props} />);
  return { ...component, props, user };
}

describe('Component', () => {
  it('renders', async () => {
    const { findByTestId } = setup();
    expect(await findByTestId('component-id')).toBeVisible();
  });
});
```

## Environment Variables
- `REACT_APP_API_BASE` — API base URL.
- `REACT_APP_VERSION` — Application version (auto-set from git).

## Code Review Checklist
- TypeScript strict mode compliance (no `any`).
- ESLint and Prettier pass (`tsc --noEmit && npm run lint`).
- Tests written with proper coverage.
- Components use proper naming conventions (PascalCase, `I`-prefixed interfaces).
- API calls use `handleFailure` for error handling.
- User interactions use `userEvent` (not `fireEvent`).
- Test selectors use `data-test-id`.

## Do NOT

- Add comments unless explicitly asked
- Use `console.log` (lint error)
- Use `any` type (lint error)
- Create class components
- Run or write database migrations — suggest them in chat only
- Commit changes unless explicitly asked
