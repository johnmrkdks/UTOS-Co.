# Project Structure & Code Organization

## Package Manager
- Use `pnpm` for all package installations and management

## Core Libraries and Versions
- Tanstact Router: ^1.x.x
- React: ^19.x.x
- React DOM: ^19.x.x
- TypeScript: ^5.x.x
- Tailwind CSS: ^4.x.x
- shadcn/ui: Latest components
- Zod: ^4.x.x
- Tanstack Query: ^5.x.x
- Zustand: ^4.x.x
- TRPC Client: ^10.x.x
- Date FNS: ^4.x.x
- Better Auth: ^1.x.x
- @tprc/tanstack-react-queryt: ^11.x.x

## Naming Conventions
- `kebab-case` - for all folders/files
- `_kebab-case` - for feature and route domain's specific common modules.
- `PascalCase` - for classes and types
- `snake_case` - for database tables, zod schemas and columns
- `camelCase` - for functions and etc.

## Common Modules
- `assets` - for assets
- `components` - for components
- `constants` - for constants
- `contexts` - for react context api
- `hooks` - for custom hooks, tanstack query and mutation
- `lib` - for 3rd party integrations libraries
- `stores` - for stores (e.g. `zustand`)
- `types` - for types
- `utils` - for utilities
  
## Domain Folders
- `src` - main source code and shared common modules
- `src/features` - main features folder

## Shared Modules Structure
Shared modules follow this structure:

```
src/
├── assets/                 # Shared assets module
├── components/             # Shared dumb components module
│   └── ui/                 # UI components (button, input, etc.)
├── constants/              # Shared constants module
├── contexts/               # Shared react context api module
├── hooks/                  # Shared custom hooks, tanstack query and mutation
│   ├── use-<hook-name>.ts  # Shared custom hook
│   └── query/              # React-query hooks
│       ├── use-<hook-name>-query.ts     # Shared react-query query (Only if necessary)
│       └── use-<hook-name>-mutation.ts  # Shared react-query mutation (Only if necessary)
├── lib/                    # Shared 3rd party integrations
├── stores/                 # Shared state stores (e.g., zustand)
├── types/                  # Shared types
└── utils/                  # Shared utilities
```

## Feature Domain Structure - Optional
When creating new feature files, follow this structure:

```
src/features/<feature-name>/
├── _assets/                # Feature's assets (only if necessary)
├── _components/            # Feature's components
├── _constants/             # Feature's constants
├── _contexts/              # Feature's react context API
├── _hooks/                 # Feature's hooks, tanstack query and mutation (only if necessary)
├── _pages/                 # Feature's pages components (only if necessary)
├── _lib/                   # Feature's 3rd party integrations (only if necessary)
├── _stores/                # Feature's state stores (e.g., zustand)
├── _types/                 # Feature's types
└── _utils/                 # Feature's utilities
```

## Nested Feature Domain Structure - Optional
When creating new nested feature files, follow this structure:
```
src/features/<feature-name>/_pages/<nested-feature-name>/
├── _components/            # Nested feature's components
├── _constants/             # Nested feature's constants
├── _contexts/              # Nested feature's react context API
├── _hooks/                 # Nested feature's hooks, tanstack query and mutation
├── _lib/                   # Nested feature's 3rd party integrations (only if necessary)
├── _stores/                # Nested feature's state stores (e.g., zustand)
├── _types/                 # Nested feature's types
└── _utils/                 # Nested feature's utilities
```

