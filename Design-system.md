# Design System — DDM-PMMS

**Status:** proposed. Items marked **(Proposed)** need approval. If the repository already has a UI library, theme, or tokens, follow them and adapt this file instead of overriding them.

**Read with:** `architecture.md`, `frontend-guidelines.md`, `AGENTS.md` section 13.

## 1. Design intent

DDM-PMMS is an internal government work tool used for hours at a time by Admins, Project Engineers, Viewers, and the Section Head. The design must be:

- **Clear over decorative.** Dense, scannable tables and forms. No ornamental animation.
- **Trustworthy.** Official records need unambiguous labels, visible reasons, and predictable actions.
- **Safe.** Destructive and irreversible-feeling actions are distinct, named, and confirmed. Archive is never styled or worded like delete.
- **Accessible.** WCAG 2.1 AA. Status is never conveyed by color alone.
- **Consistent.** The same concept looks and reads the same everywhere (a Critical project is the same badge in a list, a detail page, a dashboard, and a report).

## 2. Foundation decisions (Proposed)

| Topic | Proposal | Reason |
| --- | --- | --- |
| UI library | **shadcn/ui with Tailwind CSS** | Pairs naturally with TanStack Table for dense data views, tokens are CSS variables, and components are owned in the repo, so there is no version lock-in. MUI is an acceptable alternative. **Decision needed** (development-workflow section 11). Follow whichever is already installed. |
| Icons | One icon set, used consistently (for example Lucide with shadcn/ui) | Status badges use icon plus text. |
| Density | Compact tables, comfortable forms | Office use with long lists. |
| Visual direction | **Follow the Figma mockups** (login, Superadmin dashboard, Projects, User Management, Reports): blue app bar, white tab row, blue table headers, bright status pills, rounded bordered cards. Colors are in section 3. | The user supplied the mockups and asked for this palette (2026-11-05). |
| Navigation | Top app bar with a tab row (Dashboard, Projects, Users, Reports in the mockups), not a sidebar. A second, green-sidebar variant appears in one corner of the board and is **not** used unless the user says so. | Matches 5 of the 6 mockup frames. **Confirm.** |
| Responsive scope | Desktop first, fully usable on tablet width, no dedicated phone layout | Office tool. **Confirm.** |
| Dark mode | Not in scope unless approved. Build with tokens so it is possible later. | Avoid unrequested work. |
| Language | English | **Confirm** whether Filipino or other languages are needed. |

## 3. Design tokens

The palette comes from the Figma mockups. Hex values marked "mockup" were sampled from an exported screenshot of the board, so confirm them against the Figma file before they are final. Components use **semantic tokens only**, never raw colors. Every text and background pair must pass the contrast rules in section 9.

**Mockup palette (the four brand hues)**

| Hue | Mockup hex | Where the mockups use it |
| --- | --- | --- |
| Blue | `#007FFF` | App bar, table headers, Add buttons, active tab, "On-going" status, blue charts |
| Orange | `#FF9500` | "Suspended" status, warning icon, orange charts |
| Red | `#B52C2C` | "Terminated" status, red charts |
| Green | `#3FA818` | "Completed" status, completed card icon, green charts |

**Core tokens**

| Token | Value | Source | Use |
| --- | --- | --- | --- |
| `--color-brand` | `#007FFF` | mockup | App bar fill, active nav marker, focus ring, chart blue. Large text and graphics only (white on it is 3.8:1). |
| `--color-primary` | `#0060C7` | adjusted | Buttons, table headers, links with small white text (6.0:1). |
| `--color-primary-hover` | `#0055B3` | adjusted | Hover and pressed (7.1:1). |
| `--color-primary-text` | `#FFFFFF` | | Text on primary. |
| `--color-bg` | `#F3F4F6` | proposed | Page background. The mockups use `#E2E2E2` on some frames and near-white on the dashboard; one value is proposed for consistency. |
| `--color-surface` | `#FFFFFF` | mockup | Cards, tables, dialogs. |
| `--color-surface-muted` | `#F8F9FA` | proposed | Table stripes, filter bars. |
| `--color-text` | `#1E1E1E` | proposed | Primary text. |
| `--color-text-muted` | `#595959` | proposed | Secondary text (7.0:1 on white). |
| `--color-text-inverse` | `#FFFFFF` | | Text on dark fills. |
| `--color-border` | `#D0D5DB` | proposed | Card and table dividers. |
| `--color-border-strong` | `#8A8F98` | proposed | Input borders (must reach 3:1 on white). |
| `--color-focus-ring` | `#007FFF` | mockup | Visible keyboard focus on every interactive element. |
| `--color-danger` | `#B52C2C` | mockup | Destructive actions and errors. |
| `--color-success` | `#2E7D12` | adjusted | Success messages. |
| `--color-warning-bg` / `-text` / `-border` | `#FFF4CC` / `#7A5200` / `#F5B700` | proposed | The "attention" banner on the dashboard. |
| `--color-info` | `#0060C7` | adjusted | Informational notices. |

**Project status and indicator tokens** are in section 4. **Document access level tokens** are in section 5.

**Contrast adjustments (why some shades differ from the mockup).** White text on the mockup blue is 3.8:1, on the mockup green 3.1:1, and on the mockup orange 2.2:1. WCAG AA needs 4.5:1 for small text. So:

- Blue buttons, table headers, and "Ongoing" pills use the darker `#0060C7`. The app bar keeps `#007FFF` because it carries only the large department title.
- "Completed" pills use the darker green `#2E7D12`.
- Orange pills keep `#FF9500` but use dark text `#1E1E1E` (7.6:1).
- Red already passes (6.3:1 with white text) and is unchanged.

If you want the exact mockup shades everywhere, small white text on them will fail AA. That is a trade-off for you to decide (development-workflow section 11, decision 9).

**Chart colors.** Charts use the exact mockup hues (`#007FFF`, `#FF9500`, `#3FA818`, `#B52C2C`) for fills. Orange on white is only 2.2:1, so every chart must also show a legend with text, data labels or tooltips, and the same data in a table. Never rely on color alone.

**Scale (Proposed):** spacing on a 4 px grid (4, 8, 12, 16, 24, 32, 48); radius 4 px for controls and 8 px for cards and dialogs; one subtle elevation for dialogs and popovers only; type scale 12, 14 (body), 16, 20, 24, 30 with a system font stack unless a brand font is supplied; line height 1.5 for body.

## 4. Project status and monitoring indicator

These are **two different things** and must never be confused or merged into one badge. Status is what the PE records. The indicator is what the server computes from dates and status.

**Status badge** (lifecycle). A **solid filled pill**, as in the mockups:

| API value | Label | Fill | Text | Contrast | Mockup |
| --- | --- | --- | --- | --- | --- |
| `not_started` | Not started | `#595959` | white | 7.0:1 | not shown in the mockups |
| `ongoing` | Ongoing | `#0060C7` | white | 6.0:1 | blue `#007FFF`, darkened |
| `suspended` | Suspended | `#FF9500` | `#1E1E1E` | 7.6:1 | orange, kept |
| `postponed` | Postponed | `#FF9500` | `#1E1E1E` | 7.6:1 | not shown; same orange, label tells them apart |
| `completed` | Completed | `#2E7D12` | white | 5.2:1 | green `#3FA818`, darkened |
| `terminated` | Terminated | `#B52C2C` | white | 6.3:1 | red, kept |

The mockups write "On-going". The label here is "Ongoing" to match the API value. Use the mockup spelling if the department prefers it.

**Indicator badge** (monitoring). A **tinted pill with a border and an icon**, never a solid pill, so it cannot be mistaken for a status:

| API value | Label | Background | Text and border | Contrast | Icon | Meaning |
| --- | --- | --- | --- | --- | --- | --- |
| `normal` | Normal | `#E6F2FF` | `#0055B3` | 6.3:1 | circle-check | More than 35 days remain |
| `critical` | Critical | `#FFF4CC` | `#7A5200` (border `#F5B700`) | 6.3:1 | alert-triangle | 0 to 35 days remain |
| `overdue` | Overdue | `#FBE9E9` | `#B52C2C` | 5.3:1 | alert-octagon | Past the finish date and unfinished |
| `paused` | Paused | `#FFF1DB` | `#9A5700` | 5.1:1 | pause | Suspended or postponed; not counted |
| `completed` | Completed | `#E8F5E1` | `#2A6F10` | 5.5:1 | check-check | Done |
| `terminated` | Terminated | `#EEEEEE` | `#404040` | about 8:1 | ban | Ended; excluded |

Colors are kept consistent with the status pills where the meaning is the same (Paused is orange like Suspended, Completed is green). Overdue is the only red indicator, and Terminated is grey in the indicator but red as a status, so a red tinted badge always means Overdue.

Rules:

- The badge shows **icon + text**, never color alone, and has an accessible name such as "Indicator: Critical, 12 days remaining".
- Show `days_remaining` next to Normal, Critical, and Overdue (for Overdue show "N days overdue"). For Paused show days paused when the API provides it.
- Where a project has a `revised_finish_date`, show both the planned and revised dates and label which one drives the indicator.
- Never compute any of this in the browser.

## 5. Document access level

| API value | Label | Style |
| --- | --- | --- |
| `restricted` | Restricted | Orange tint (`#FFF1DB`, text `#9A5700`) with border and lock icon |
| `confidential` | Confidential | Red tint (`#FBE9E9`, text `#B52C2C`) with border and shield icon |

There is no "open" level. Show the effective level (the API returns it) on every document row and detail view. Next to it show the user's own download state:

| State | Control |
| --- | --- |
| `can_download` is true | **Download** button |
| An approved, unexpired request exists | Download button plus "Approved until (date)" |
| A request is pending | Disabled "Request pending" with the request date |
| None of the above | **Request download** button |

## 6. Component inventory

Primitives come from the chosen library. The following project components are specified here so every screen builds them the same way. Each lives in `shared/components` unless noted.

| Component | Specification |
| --- | --- |
| `DataTable` | TanStack Table. Server-side pagination, sort, and filter. Sticky header. Row actions in a trailing menu. Always has loading skeleton, empty state, and error state. Money right-aligned. |
| `FilterBar` | Drives URL search params. Shows active filters as removable chips. "Clear all" action. |
| `IndicatorBadge`, `StatusBadge`, `AccessLevelBadge` | As in sections 4 and 5. One implementation each. |
| `ReasonDialog` | A dialog with a required reason field (minimum 10 characters where the backend requires it), a clear title naming the action, and a primary button with the action name. Used for pause, resume, terminate, reopen, reassign, correct dates, delete, restore, and archive with reason. |
| `ConfirmDialog` | Used for completing a project at 100% progress and other irreversible-feeling actions. States the consequence in plain words. |
| `FileUpload` | Drag and drop plus button. Shows allowed types and the 50 MB limit, selected file name and size, progress, and server errors. Keyboard operable. |
| `VersionList` | Version number, uploader, date, size, change note, and per-version download (subject to the same download rules). Marks the current version. |
| `HistoryTimeline` | Project history grouped by `change_set_id`. Each group shows actor, action, time, reason, and a before and after for every changed field. Read-only. |
| `RequestDownloadDialog` | Reason field (10 to 1000 characters). Explains who will review it. |
| `StatCard` | Dashboard counts with a label, a number, and an optional link to the filtered list. |
| `PermissionGate` (`<Can>`) | See `architecture.md` section 7. |
| `EmptyState`, `ErrorState`, `ForbiddenState`, `NotFoundState`, `Skeleton` | Consistent wording and layout for every data view. |
| `PageHeader`, `Breadcrumbs`, `Toast` | Standard page chrome and transient feedback. |
| Charts | ApexCharts wrappers that use the indicator tokens. Every chart is paired with the same data in a table or accessible summary. |

## 7. Patterns

**Forms**

- Visible label above every field. Placeholder text is never the label.
- Required fields marked and announced. Errors appear inline under the field and in an error summary on submit.
- Server `422` errors map onto fields. The first invalid field receives focus.
- Money fields accept decimals and display with thousands separators. Dates use a date picker plus typed entry.
- Fields the user may not edit (for example planned dates after a project has started) are shown as read-only text with a short explanation, not as silently disabled inputs.

**Lifecycle actions on a project** (PE): Start, Report progress, Suspend, Postpone, Resume. Only the actions valid for the current status are offered. Resume asks for a new finish date and a remark. Reporting 100% asks for confirmation that this completes the project.

**Administer actions** (Admin and Super Admin): Terminate, Reopen, Reassign, Correct planned dates, Delete, Restore. They live in a separate "Administer" menu, always use `ReasonDialog`, and are styled as sensitive actions.

**Archive versus delete (documents).** Archive is a normal, reversible action with its own label and icon. Delete is available only to Super Admin, uses danger styling and a reason, and is described as "Delete (can be undone by Super Admin)". Never use the same icon or color for both.

**Tables**

- Default sort is the most useful (projects by finish date, documents by newest). Show the active sort.
- Row click opens the detail view. Row menu holds secondary actions.
- Selected filters and page are in the URL.

## 8. Formatting rules

| Value | Rule |
| --- | --- |
| Money | The API sends decimal strings. Format with `Intl.NumberFormat` and keep two decimals. Philippine peso (₱) is **assumed** from the Asia/Manila setting. **Confirm.** Never do arithmetic with floating point on money in the browser. |
| Dates | The API sends `YYYY-MM-DD`. Display as "Mar 5, 2026" (Proposed). Never apply a timezone shift to a date-only value. |
| Timestamps | ISO 8601 from the API, displayed in `Asia/Manila` with a clear format, for example "Mar 5, 2026, 2:30 PM". |
| Durations | Calendar days. "12 days remaining", "3 days overdue". |
| File size | KB, MB with one decimal. |
| Progress | Whole number percent with a progress bar and the number as text. |

## 9. Accessibility checklist

- Contrast: 4.5:1 for body text, 3:1 for large text and UI boundaries.
- Everything works with the keyboard. Focus order follows reading order and the focus ring is always visible.
- Dialogs trap focus, restore focus on close, and are labelled. Escape closes non-destructive dialogs.
- Tables use proper header cells. Sortable headers announce their state.
- Status, indicator, and access level use text and icon, never color alone.
- Form errors are announced and associated with their fields.
- Respect reduced-motion preferences. Avoid motion beyond simple transitions.
- Every icon-only button has an accessible name.
- Charts have a text or table alternative.

## 10. Content and wording

- Use the department's terms: project, Project Engineer, Data Management Section, planned finish date.
- Buttons name the action ("Suspend project", "Request download"), not "OK" or "Submit".
- Explain consequences before irreversible-feeling actions, and ask for a reason when the backend requires one.
- Error messages say what happened and what to do. Never expose server internals or technical codes to users.
- Do not promise automatic notifications. None exist in this release.

## 11. What this file does not decide

Colors now follow the Figma mockups (section 3). The city seal and logo usage, a custom font, dark mode, and mobile layouts are not decided. The mockups cover only login, dashboard, projects, users, and reports; DDM document screens, project detail, and the dialogs have no mockups yet and follow the components in section 6. They are listed in `development-workflow.md` section 11.