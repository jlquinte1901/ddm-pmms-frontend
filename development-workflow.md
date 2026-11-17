# Development Workflow — DDM-PMMS Frontend

**Status:** proposed working agreement for the AI engineering assistant and the human team. It extends `AGENTS.md` section 14 and section 15; if they differ, `AGENTS.md` wins.

**Read with:** `Architecture.md`, `frontend-guidelines.md`, `feature-specification.md`, `api-contracts.md`, `Design-system.md`.

## 1. Principles

1. Work only on the stage or task the user approves.
2. Inspect before changing. Understand the repository's existing code first.
3. Small, reviewable slices, each fully finished before the next.
4. Never claim something works unless it was run and checked.
5. Ask before anything hard to reverse, any new dependency, or any ambiguity in a business rule.
6. Do not reopen the 20 final backend decisions without the user's explicit approval.

## 2. Before starting any task

1. Read `AGENTS.md` and the frontend docs listed above.
2. Read `ddm-pmms-backend.md` section 16 (approved decisions).
3. Inspect the repository: `package.json` (installed versions and scripts), `tsconfig`, lint and format config, folder structure, routes, existing components, hooks, state, and tests. Check installed skills.
4. Identify the module (Shared Core, DDM, or PMMS) and which feature in `feature-specification.md` is affected.
5. Verify the exact method, URI, middleware, and route name in the backend's `routes/api.php`.
6. Verify the request rules, controller behavior, and Resource/response shape for every endpoint in the slice. Route existence alone does not confirm the contract.
7. Compare backend behavior with `api-contracts.md`. If a needed route is not registered, do not call it or invent a fallback; record it as blocked in section 10 and tell the user.
8. Verify package versions before relying on any API. Do not assume a version.

## 2a. Response format for a request

For each development request, respond in this order:

1. Your understanding of the requirement.
2. Module and scope (frontend, and whether the backend is involved).
3. What exists in the repository now.
4. Conflicts with approved decisions, and any ambiguities.
5. Plan: files, components, hooks, endpoints used, permissions, states, tests.
6. Implement only the approved scope.
7. Run checks.
8. Summary: files changed, behavior implemented, checks run with real results, unresolved issues.

When the user asks only for a plan or explanation, give that and do not write large amounts of code.

## 3. Task slicing

A slice is one user-visible capability, for example "PE reports progress". A slice includes:

- Types (from `api-contracts.md`)
- Endpoint functions and query or mutation hooks
- Schemas (Zod) and form
- UI with all required states (loading, empty, error, forbidden or not found, success)
- Permission gating
- Tests
- Documentation updates if behavior or contract changed

Do not mix unrelated slices. Do not start the next slice until the current one passes its definition of done.

## 4. Definition of ready

A slice may start when:

- The user approved the stage.
- Every required backend endpoint is registered and its request fields, response shape, permission middleware, and ownership checks have been checked against backend code (or the slice uses explicitly approved, documented mocks).
- The decisions it depends on are answered (section 11).
- Acceptance criteria are in `feature-specification.md`.
- The request and response names in the UI match the current backend Form Requests and API Resources, not an earlier design draft.

## 5. Definition of done

- [ ] Behavior matches `feature-specification.md` and `AGENTS.md` section 13
- [ ] No ownership or identity fields sent, no business values recomputed
- [ ] All data views have loading, empty, error, forbidden or not found, and success states
- [ ] Permissions gated in the UI, and `403` and `404` handled
- [ ] Forms validate and map server `422` errors to fields
- [ ] Accessibility checklist in `Design-system.md` section 9 passed
- [ ] Tests written and passing for the behavior (permissions, lifecycle rules, error mapping, download flow where relevant)
- [ ] Lint, type-check, and tests defined in `package.json` pass
- [ ] No `console.log`, secrets, tokens, or dead code left behind
- [ ] Contract and docs updated if anything changed
- [ ] Summary reports only what was actually run and observed

## 6. Checks to run

Use the scripts defined in `package.json` (names may differ). Typically:

1. Type-check
2. Lint
3. Unit and component tests for the changed area (narrowest relevant first)
4. Full test suite before finishing a feature
5. Production build for risky changes (routing, lazy loading, config)

If a script does not exist, say so. Do not invent success. If a check cannot be run, say why.

## 7. Dependencies and structure

- Do not install, upgrade, or replace dependencies without approval.
- Do not create new base folders or architectural layers without approval.
- Follow the existing structure. `Architecture.md` section 4 applies only if the repository has no established structure.

## 8. Handling contract gaps and conflicts

When the UI needs data or an action the current backend does not register, or the API behaves differently from the contract:

1. Stop work on that part. Do not invent endpoints, fields, or permissions.
2. Add an entry under "Open contract questions" (section 10) with what is needed and why.
3. Tell the user. Keep the affected UI slice blocked unless the user approves an explicitly marked mock or the backend implements the missing contract.
4. Continue with parts that are not blocked.

When something conflicts with an approved decision, say so and ask before proceeding.

## 9. Keeping the docs true

- A change that alters behavior, the contract, tokens, or conventions updates the matching document in the same change.
- Proposed items that the user approves are changed from "(Proposed)" to final, with the date.
- If `AGENTS.md` and these docs disagree, fix these docs, and tell the user if `AGENTS.md` itself looks wrong.

## 10. Open contract questions and backend route gaps (maintain here)

| # | Question | Status |
| --- | --- | --- |
| 1 | Active Project Engineer list for Admin (reassign dialog and assigned-PE filter); no `/pmms/engineers` route exists | Blocked; backend endpoint/permission needed, or explicitly approved alternate |
| 2 | PMMS supporting-document list, upload, download, and scoped document categories; no project-document routes exist | Blocked; backend contract and routes needed |
| 3 | Correct planned dates after project start; no administer date-correction route exists | Blocked; backend contract and route needed |
| 4 | Change password; no `/auth/change-password` route exists | Blocked; backend contract and route needed |
| 5 | DDM reports and CSV export; no `/ddm/reports/*` routes exist | Blocked; backend contract and routes needed |
| 6 | Cancel own pending download request; no cancel route exists | Blocked; backend contract and route needed |
| 7 | Download a specific historic document version; only current-version download is routed | Blocked; backend contract and route needed |
| 8 | Contract number uniqueness: current project create request requires a unique value, but the approved business rule says it is nullable and not unique | Backend/product decision conflict; resolve before finalizing registration validation |
| 9 | Runtime response-envelope and error-format verification against API tests | Inspecting Resources establishes fields, but verify serialized envelopes and error responses before wiring shared API handling |

## 11. Remaining decisions (frontend)

The UI library decision is approved: use the existing shadcn/ui and Tailwind CSS setup. The following items remain open. Until answered, follow existing repository conventions and do not install dependencies without approval.

| # | Decision | Recommendation |
| --- | --- | --- |
| 1 | Frontend test stack | Approved and installed: Vitest, React Testing Library, MSW |
| 2 | API type source | Hand-written types from `api-contracts.md` now, switch to OpenAPI generation if the backend publishes a spec |
| 3 | Folder structure | `Architecture.md` section 4, unless the repo already has one |
| 4 | Currency display | Philippine peso with two decimals |
| 5 | Date display format | "Mar 5, 2026" |
| 6 | Responsive scope | Desktop first, usable on tablet, no phone layout |
| 7 | Language | English only |
| 8 | Branding (colors, logo, font) | Colors taken from the Figma mockups (`Design-system.md` section 3); approve the contrast adjustments (darker blue and green for small white text, dark text on orange). Logo and font still open |
| 9 | Dark mode | Not now |
| 10 | Unsaved-changes warning and draft keeping | Warn on leave, no draft storage |
Decision 20 (token in `sessionStorage`) is already final and is not on this list.

## 12. Working with the backend work in progress

- Backend stages and the Spatie migration are gated separately by the user. The frontend does not depend on unmerged backend work unless the user says so.
- While an endpoint is not ready, a slice may use mocks at the network boundary, clearly marked, and must be re-verified against the real API before it is called done.
- Never change backend files from a frontend task.

## 13. Git and review (if the repository uses git)

- One slice per branch and pull request where possible.
- Commit messages describe the behavior change.
- A pull request lists: scope, files changed, checks run with results, screenshots for UI changes if available, and open questions.
- Never commit secrets, tokens, backups, or environment files.

## 14. Prompts that work well with the assistant

Give the assistant: the feature ID from `feature-specification.md` (for example "C6 pause and resume"), the stage approval, and any decisions from section 11 that apply. Example:

> Implement C5 Report progress for PE. Backend endpoint is ready. Use the existing UI library. Follow the docs. Report which checks you ran.

The assistant should answer with the response format in section 2a, then implement only that slice.

## 15. Escalate and stop when

- A requirement conflicts with an approved decision.
- A business rule is ambiguous.
- The API behaves unlike the contract.
- A change would need a new dependency, folder, or layer.
- A check fails and the cause is unclear after reasonable investigation.

State the problem plainly and propose options. Do not guess.