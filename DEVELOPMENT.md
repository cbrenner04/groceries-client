# Frontend Development Guidelines

This document outlines the development standards, patterns, and guardrails for the React/TypeScript frontend application.

## Technology Stack

- **Framework:** React 19.1.0 with TypeScript
- **Routing:** React Router v7
- **Styling:** SCSS with Bootstrap 5.3.7
- **Testing:** Jest with React Testing Library
- **Build Tool:** Create React App 5.0.1
- **HTTP Client:** Axios
- **Icons:** FontAwesome 6.7.2

## Code Style & Patterns

### TypeScript Configuration

- Use TypeScript strict mode (`strict: true`)
- Target ES2015 with DOM and ES2017 libraries
- Use `noImplicitAny: true` - explicit typing required
- Base URL set to `./src` for clean imports

### React Patterns

- Use functional components with hooks (no class components)
- Use React Router v7 for routing
- Prefer named exports over default exports
- Use React Context for global state (see `UserContext` in `AppRouter.tsx`)

### Component Structure

```
src/
├── components/          # Reusable UI components
├── routes/             # Route-specific components
├── utils/              # Utility functions
├── typings/            # TypeScript type definitions
├── hooks/              # Custom React hooks
└── index.scss          # Global styles
```

### Naming Conventions

- **Components:** PascalCase (e.g., `AppNav`, `EditListItem`)
- **Files:** PascalCase for components, camelCase for utilities
- **Interfaces:** Prefix with `I` (e.g., `IList`, `IListItem`)
- **Enums:** Prefix with `E` (e.g., `EListType`)
- **Test Files:** `ComponentName.spec.tsx`

## ESLint & Code Quality

### Strict Rules

- No console statements (`no-console: error`)
- Max line length: 120 characters
- Require curly braces for all control structures
- No unused variables (TypeScript rule)
- No explicit `any` types
- Require explicit function return types
- Require explicit module boundary types
- Use interfaces over type aliases
- Require semicolons
- Use consistent type imports

### Destructuring Rules

- Maximum 0 parameters in destructuring (use objects for multiple params)
- Prefer destructuring in function parameters

## Testing Standards

### Testing Library Setup

- Use `@testing-library/react` for component testing
- Use `@testing-library/user-event` for user interactions
- Use `@testing-library/jest-dom` for DOM matchers
- Configure `data-test-id` as test ID attribute

### Test Patterns

- Use `setup()` functions for test configuration
- Use `jest.fn()` for mocks
- Use `userEvent.setup()` for user interactions
- Use `findBy*` queries for async operations
- Use `getBy*` queries for synchronous operations
- Use `data-test-id` attributes for test selectors
- Use snapshots for UI regression testing

### Coverage Requirements

- 100% coverage for branches, functions, lines, and statements
- Exclude `AppRouter.tsx` and `index.tsx` from coverage

### Test File Structure

- Test files: `ComponentName.spec.tsx`
- Snapshot files: `__snapshots__/ComponentName.spec.tsx.snap`

## Styling

### CSS/SCSS

- Use SCSS with `node-sass`
- Use Bootstrap 5.3.7 for UI components
- Use `react-bootstrap` for React Bootstrap components
- Use FontAwesome 6.7.2 for icons

## State Management

### Authentication

- Use session storage for user tokens
- Store user data: `{ 'access-token': string, client: string, uid: string }`
- Use `UserContext` for global user state

### API Communication

- Use Axios for HTTP requests
- Configure interceptors for authentication headers
- Base URL from `REACT_APP_API_BASE` environment variable
- Handle token refresh in response interceptors

## Development Workflow

### Scripts

```bash
npm start                    # Start development server
npm run build:production     # Build for production
npm run build:staging        # Build for staging
npm run test                 # Run tests
npm run test:ci              # Run tests with coverage
npm run lint                 # Run ESLint
npm run format               # Format code with Prettier
```

### Environment Variables

- `REACT_APP_API_BASE` - API base URL
- `REACT_APP_VERSION` - Application version (auto-set from git)

## Important Notes & Gotchas

- All routes must be authenticated except `/users/sign_in`, `/users/password/new`, and `/users/password/edit`
- Use `UserContext` for global user state management
- API calls automatically include authentication headers via Axios interceptors
- Use `data-test-id` attributes for reliable test selectors
- Snapshots are used for UI regression testing

## Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] ESLint rules followed
- [ ] Tests written with proper coverage
- [ ] Components use proper naming conventions
- [ ] API calls use proper error handling
- [ ] User interactions use `userEvent`
- [ ] Test selectors use `data-test-id`

## Common Patterns

### Component Setup

```typescript
interface IComponentProps {
  // Define props interface
}

export default function ComponentName({ prop1, prop2 }: IComponentProps): React.JSX.Element {
  // Component implementation
}
```

### Test Setup

```typescript
async function setup(): Promise<{
  component: HTMLElement;
  props: IComponentProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const props = {
    // Default props
  };
  const { findByTestId } = render(<ComponentName {...props} />);
  const component = await findByTestId('component-id');
  return { component, props, user };
}
```

### API Call Pattern

```typescript
import api from 'utils/api';

const response = await api.get('/v1/lists');
const data = response.data;
```

This document should be updated as the frontend codebase evolves and new patterns emerge. 