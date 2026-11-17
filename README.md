# DDM-PMMS Frontend

Frontend for the Digital-Based Document Management and Project-Based Monitoring Management System (DDM-PMMS).

## Current project

This repository currently contains a React 19, TypeScript, and Vite application with Tailwind CSS and shadcn/ui. The app is being developed in small, approved feature slices against the Laravel API.

## Documentation

- [Frontend engineering guide](./ddm-pmms-frontend.md) — screen inventory, shared components, forms, hooks, tests, and build phases.
- [Frontend architecture](./Architecture.md) — module boundaries, state, authentication, permissions, errors, and routing.
- [Design system](./Design-system.md) — design tokens, components, interaction patterns, and accessibility.
- [Feature specifications](./feature-specification.md) — user-facing behavior and acceptance criteria.
- [API contracts](./api-contracts.md) — frontend API types, endpoints, and open contract gaps.
- [Frontend guidelines](./frontend-guidelines.md) — TypeScript, React, API, form, and testing conventions.
- [Development workflow](./development-workflow.md) — readiness, implementation, and verification process.
- [Project instructions](./AGENTS.md) — shared DDM-PMMS business rules and repository guidance.

The detailed guides include proposed items and unresolved questions. Confirm those before implementing any feature that depends on them; the backend API and `AGENTS.md` remain authoritative for business rules and security.

## Commands

```sh
npm run dev
npm run lint
npm run build
npm run preview
```

There is currently no test script in `package.json`. Add or install test tooling only after approval, as described in the development workflow.
