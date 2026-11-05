# Frontend Guidelines — DDM-PMMS

**Status:** proposed coding standard. The repository's existing ESLint, Prettier, TypeScript, and naming conventions take precedence. Where they are silent, follow this file.

**Read with:** `AGENTS.md` (especially section 13, Frontend Rules), `architecture.md`, `design-system.md`, `api-contracts.md`.

## 1. Hard rules (never break)

These come from `AGENTS.md` and the final backend decisions. A change that breaks one is rejected.

1. **Never rely on the UI for security.** The backend decides permissions, ownership, and access levels.
2. **Never send ownership or identity fields** (`user_id`, `role_id`, `assigned_pe_id`, `created_by`, `uploaded_by`, `decided_by`) from forms. The only exceptions are the user-administration screen (`role_id`) and the reassign action (`assigned_pe_id`).
3. **Never recompute backend values in the browser:** the 35-day indicator, `days_remaining`, `can_download`, effective access level, current version, dashboard totals.
4. **Never build file URLs or storage paths.** Downloads use the authorized endpoint.
5. **Never put the token in a URL, a log, or any storage other than `sessionStorage`.**
6. **Never filter or paginate lists in the browser.** Send filters, sort, and page to the API.
7. **Never edit or delete project history, audit records, or document versions from the UI.**
8. **Never add a dependency, a base folder, or an architectural layer without approval.**
9. **Never invent features:** email, SMS, push notifications, automatic progress, and automatic status changes are out of scope.
10. **Never claim a screen works** unless you ran it and the relevant checks.

## 2. TypeScript

- `strict` mode on. No `any`. Use `unknown` and narrow it. No non-null assertions (`!`) except in tests.
- Model API data with the types in `api-contracts.md`. Do not redefine them in components.
- Use string-literal union types or `as const` objects for enums (`ProjectStatus`, `Indicator`, `AccessLevel`, `RequestStatus`). Never use magic strings in components.
- Money is typed as `string` (a decimal string) and never converted to `number` for arithmetic.
- Dates from the API are `string` in `YYYY-MM-DD` or ISO 8601 form. Parse only for display.
- Prefer `type` for data shapes and `interface` only when extending.
- Export types from the feature's `types.ts`, and export the feature's public API only through `index.ts`.

## 3. Naming and files

| Item | Convention |
| --- | --- |
| Components | `PascalCase.tsx`, one main component per file |
| Hooks | `useThing.ts`, named export |
| API functions | `camelCase`, verb first (`listProjects`, `submitProgress`) |
| Query hooks | `useProjectsQuery`, mutation hooks `useSubmitProgressMutation` |
| Zod schemas | `thingSchema` in `schemas/` |
| Tests | Next to the file as `Thing.test.tsx` |
| Imports | Absolute alias (`@/`) for cross-folder imports, relative only within a feature folder |

## 4. React

- Function components and hooks only. Components stay small and single-purpose. Extract a component when a section has its own state or is reused.
- **Do not fetch data in `useEffect`.** Use TanStack Query. Do not mirror server data into `useState`.
- Derive values during render instead of storing them in state.
- Memoize (`useMemo`, `useCallback`, `memo`) only after measuring a real problem.
- Stable `key` values from IDs, never array indexes for dynamic lists.
- Lazy-load route components. Keep heavy libraries (charts) out of the main bundle.
- No `dangerouslySetInnerHTML`. Render all server text as plain text.

## 5. API layer

- One configured Axios instance in `shared/api`. It sets the base URL `/api/v1`, attaches the Bearer token, and normalizes errors into `ApiError` (see `architecture.md` section 8).
- Components and pages never import Axios. They use feature hooks that call typed endpoint functions.
- Endpoint functions return typed data, validate nothing about business rules, and contain no UI logic.
- Query keys come from a per-feature key factory. After a mutation, invalidate the keys listed in `architecture.md` section 5.
- Send filters exactly as the API documents them. Do not send empty or undefined filter values.
- Do not retry non-idempotent requests automatically. Retries are for reads only.

## 6. Forms and validation

- React Hook Form with a Zod schema per form.
- Mirror the backend rules for fast feedback, and treat the server as the authority. Do not copy business logic beyond simple field rules.
- Key rules to mirror:
  - Progress: integer 0 to 100. Lowering progress requires remarks.
  - Report date: not in the future.
  - Planned finish date not before planned start date.
  - Reasons: at least 10 characters for pause, resume, and similar actions where the backend requires it.
  - Resume: `revised_finish_date` not before today, plus a remark.
  - Download request reason: 10 to 1000 characters.
  - Upload: allowed extensions, 50 MB.
  - Passwords: at least 12 characters.
- On `422`, map `errors` to fields and focus the first invalid one.
- Disable the submit button while a request is in flight to prevent double submits.

## 7. Permissions and state

- Use `usePermission`, `<Can>`, and route guards. Never compare role names or IDs in components.
- A hidden control is not a secured control. Handle `403` and `404` responses for visible actions.
- Session state is the only global Zustand store. Do not add stores for server data.
- Filters, sort, search, and page live in URL search params through a shared `useUrlFilters` hook.

## 8. Security

- Treat all API text, file names, and remarks as untrusted. Render as text.
- Never log tokens, passwords, or full API payloads. Do not leave `console.log` in committed code.
- Do not store secrets in the repository, environment files that are committed, or the bundle. Public configuration only (such as the API base URL).
- Client-side file checks are hints. Always show the server's validation result.
- Clear the session on `401` and on logout. Do not keep user or permission data in storage.
- Do not expose internal IDs or technical error codes to end users beyond what the design calls for.

## 9. Required states for every data view

Every list, detail, dashboard card, and report must implement all of these, using the shared state components:

1. Loading (skeleton, not a bare spinner where layout is known)
2. Empty (with a helpful next step where one exists)
3. Error (with retry)
4. Forbidden (`403`) and not found (`404`)
5. Success

A screen without these is not done.

## 10. Testing

Use the installed tooling. **(Proposed)** if none exists: Vitest, React Testing Library, and MSW, which need approval.

Test behavior the user can see, not implementation details. Priorities:

- **Permission rendering.** For each role (Super Admin, Admin, PE, Viewer with and without grants), the right navigation and actions appear and the wrong ones do not.
- **Project lifecycle forms.** Required reasons, the resume date rule, the confirm step at 100%, and that only valid actions for the current status are offered.
- **Indicator display.** The UI shows exactly what the API sends (all six indicators, including Paused and Terminated) and never recomputes it.
- **Download flow.** `can_download` true shows Download. False shows Request. `403 download_approval_required` opens the request dialog. Pending and approved states render correctly.
- **Error mapping.** `401`, `403`, `404`, `409`, `422`, `429`, `500`.
- **Filters.** Filter changes update the URL and send the right query. A PE never sees an assigned-PE filter.
- **Forms.** Validation messages and server field errors.

Rules: query by role and accessible name, not by test IDs or class names; mock at the network boundary; one behavior per test; name tests by behavior ("shows Request download when the user cannot download directly"). Run the narrowest relevant tests, then the full suite before finishing a feature, and report only results you actually saw.

## 11. Performance

- Route-level code splitting. Lazy-load charts.
- Debounce search (about 300 ms) and use the query library's cancellation.
- Server-side pagination (maximum page size 100). Keep previous data visible while the next page loads.
- Avoid rendering very long lists without pagination.
- Do not store large objects in global state.

## 12. Accessibility

Follow `design-system.md` section 9. In code review check: keyboard use, focus handling in dialogs, labels on every input, accessible names on icon buttons, table semantics, and that no state is conveyed by color alone.

## 13. Comments and documentation

- Prefer clear names over comments. Comment the reason for non-obvious decisions, not what the code does.
- Document props with TypeScript types. Add short JSDoc to shared components.
- When a decision changes behavior, update the relevant document in the same change (see `development-workflow.md` section 9).

## 14. Review checklist (use on every change)

- [ ] Within the approved scope, no unrequested features or dependencies
- [ ] Types match `api-contracts.md`, no `any`
- [ ] No ownership or identity fields sent, no business values recomputed
- [ ] Loading, empty, error, forbidden, and success states present
- [ ] Permissions gated in the UI and `403` and `404` handled
- [ ] Forms validate and map server errors
- [ ] Accessibility checks done
- [ ] Tests added or updated and run, results reported honestly
- [ ] Lint and type-check pass
- [ ] No secrets, tokens, or `console.log` left behind