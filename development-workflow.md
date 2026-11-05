# Development Workflow — DDM-PMMS Frontend

**Status:** proposed working agreement for the AI engineering assistant and the human team. It extends `AGENTS.md` section 14 and section 15; if they differ, `AGENTS.md` wins.

**Read with:** `architecture.md`, `frontend-guidelines.md`, `feature-specifications.md`, `api-contracts.md`, `design-system.md`.

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
4. Identify the module (Shared Core, DDM, or PMMS) and which feature in `feature-specifications.md` is affected.
5. Confirm the endpoints exist and match `api-contracts.md`. If not, stop and raise it (section 8).
6. Verify package versions before relying on any API. Do not assume a version.

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
- The backend endpoints exist and match the contract (or the slice uses documented mocks and says so).
- The decisions it depends on are answered (section 11).
- Acceptance criteria are in `feature-specifications.md`.

## 5. Definition of done

- [ ] Behavior matches `feature-specifications.md` and `AGENTS.md` section 13
- [ ] No ownership or identity fields sent, no business values recomputed
- [ ] All data views have loading, empty, error, forbidden or not found, and success states
- [ ] Permissions gated in the UI, and `403` and `404` handled
- [ ] Forms validate and map server `422` errors to fields
- [ ] Accessibility checklist in `design-system.md` section 9 passed
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
- Follow the existing structure. `architecture.md` section 4 applies only if the repository has no established structure.

## 8. Handling contract gaps and conflicts

When the UI needs data or an action the contract lacks, or the API behaves differently from the contract:

1. Stop work on that part. Do not invent endpoints, fields, or permissions.
2. Add an entry under "Open contract questions" (section 10) with what is needed and why.
3. Tell the user. Propose an option, as `api-contracts.md` does for the four known gaps.
4. Continue with parts that are not blocked.

When something conflicts with an approved decision, say so and ask before proceeding.

## 9. Keeping the docs true

- A change that alters behavior, the contract, tokens, or conventions updates the matching document in the same change.
- Proposed items that the user approves are changed from "(Proposed)" to final, with the date.
- If `AGENTS.md` and these docs disagree, fix these docs, and tell the user if `AGENTS.md` itself looks wrong.

## 10. Open contract questions (maintain here)

| # | Question | Status |
| --- | --- | --- |
| 1 | Endpoint for listing active PEs for Admin (reassign dialog, assigned-PE filter). Proposal: `GET /pmms/engineers` | Open |
| 2 | Exact paths for the administer actions | Open, confirm |
| 3 | Category list scoped to `pmms` for project documents. Proposal: `GET /pmms/document-categories` | Open |
| 4 | Filter options for fund source, region, LGU, contractor. Proposal: `GET /pmms/filter-options` | Open, optional |
| 5 | Final field names of API Resources (confirm against the real backend) | Open |
| 6 | OpenAPI document available for generating types? | Open |

## 11. Decisions the user must make (frontend)

None of these is decided. Until answered, the assistant follows what is already installed in the repository, and otherwise asks.

| # | Decision | Recommendation |
| --- | --- | --- |
| 1 | UI library | shadcn/ui with Tailwind CSS, unless one is already installed |
| 2 | Frontend test stack | Vitest, React Testing Library, MSW, unless something is already installed |
| 3 | API type source | Hand-written types from `api-contracts.md` now, switch to OpenAPI generation if the backend publishes a spec |
| 4 | Folder structure | `architecture.md` section 4, unless the repo already has one |
| 5 | Currency display | Philippine peso with two decimals |
| 6 | Date display format | "Mar 5, 2026" |
| 7 | Responsive scope | Desktop first, usable on tablet, no phone layout |
| 8 | Language | English only |
| 9 | Branding (colors, logo, font) | Colors taken from the Figma mockups (`design-system.md` section 3); approve the contrast adjustments (darker blue and green for small white text, dark text on orange). Logo and font still open |
| 10 | Dark mode | Not now |
| 11 | Unsaved-changes warning and draft keeping | Warn on leave, no draft storage |
| 12 | Approve the four API gaps' proposals | Yes, so Admin screens can be built |

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

Give the assistant: the feature ID from `feature-specifications.md` (for example "C6 pause and resume"), the stage approval, and any decisions from section 11 that apply. Example:

> Implement C5 Report progress for PE. Backend endpoint is ready. Use the existing UI library. Follow the docs. Report which checks you ran.

The assistant should answer with the response format in section 2a, then implement only that slice.

## 15. Escalate and stop when

- A requirement conflicts with an approved decision.
- A business rule is ambiguous.
- The API behaves unlike the contract.
- A change would need a new dependency, folder, or layer.
- A check fails and the cause is unclear after reasonable investigation.

State the problem plainly and propose options. Do not guess.