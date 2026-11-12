# Runtime and environment rules

**Job:** Define rendering, runtime error handling, and environment-setting behavior.
**Source:** PRD technical requirements.
**Held elsewhere:** Stack and approved packages are in AGENTS.md. Capacity transactions are in capacity-rules.md. Plans are in free-tier-rules.md. Test protocol is in test-rules.md.

## Rendering and speed

- **Rule:** Render public event details on the server where practical and return only the fields allowed by security-rules.md.
  **Why:** Guests need invite details quickly, and server rendering avoids sending unnecessary data to the browser.
- **Rule:** Use the under-30-second timing definition in product-rules.md and the repeatable mobile/network profile in test-rules.md. Report first request after idle separately from warmed requests.
  **Why:** One shared measurement prevents conflicting interpretations of the core-action target.

## Failure handling

- **Rule:** A failure must show a user-safe message and a next step where retrying or contacting the host is appropriate. Never render a blank screen or expose a stack trace.
  **Why:** Users need to know what happened without receiving internal technical details.
- **Rule:** Use exact RSVP messages from product-rules.md. Log server-side diagnostic details without logging passwords, secrets, or full guest contact data.
  **Why:** Consistent copy helps guests act while private details remain protected.

## Environment settings

- **Rule:** Whenever code requires an environment variable, add its name and safe placeholder to .env.example and document its purpose and whether it is public or secret in the setup notes.
  **Why:** The app must be reproducible without exposing credentials.
- **Rule:** Never commit actual secret values. Do not expose secrets through browser-prefixed variables or client bundles.
  **Why:** Repository history and browser code are not secret storage.
- **Rule:** Ask the owner only for values or cost decisions that require their account; do not ask permission merely to document a newly required variable name.
  **Why:** Routine setup should proceed while account-specific secrets remain under owner control.
- **Rule:** Keep the variable list consistent with the stack in AGENTS.md and update setup notes when that stack changes.
  **Why:** Environment names and visibility depend on the selected provider.
