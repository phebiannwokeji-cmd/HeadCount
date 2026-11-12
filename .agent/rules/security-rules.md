# Security and access rules

**Job:** Define access control, personal-data visibility, session handling, and abuse controls.
**Source:** PRD access and privacy requirements and technical requirements.
**Held elsewhere:** Guest-facing behavior and notice copy are in product-rules.md. Field definitions are in data-rules.md. Provider choices are in AGENTS.md.

## Authentication and ownership

- **Rule:** Use the selected authentication provider to store passwords. Never store plaintext passwords or app-owned password hashes.
  **Why:** Password storage and verification belong to the authentication provider.
- **Rule:** Verify the signed-in host and event ownership in every server-side host action. Also enforce ownership in database row-level access policies.
  **Why:** A hidden control or guessed event address must not grant access; database policies provide a second enforcement layer.
- **Rule:** Guests can open a public event page and submit a validated RSVP without signing in. Public access does not grant access to host actions or RSVP records.
  **Why:** The RSVP flow must be easy to enter while guest-list data remains private.
- **Rule:** Return only public event fields to the guest page. Expose guest names and contacts only to the host who owns that event.
  **Why:** Guest details are provided to the event’s host, not to other guests.
- **Rule:** Use the selected authentication provider’s supported secure session method. Never invent a custom password or session scheme.
  **Why:** Established provider session handling avoids unsafe credential and token handling.

## Guest notice

- **Rule:** Show the exact privacy notice in product-rules.md before the guest submits an RSVP.
  **Why:** Guests should know who receives their name and contact details.

## Secrets

- **Rule:** Keep database credentials and other secret keys in environment-managed secret storage. Never commit them or place them in browser-visible code.
  **Why:** Anyone with repository or browser access could otherwise use the secret.
- **Rule:** Use only the minimum database privileges required by the server action. A secret database role must never be used from guest browser code.
  **Why:** A leaked secret must not provide unnecessary database access.

## Spam control

- **Rule:** Rate-limit public RSVP submissions per event and client IP. The initial limit must allow at least 150 submissions from one shared venue IP in a 10-minute period; test this against maximum event capacity.
  **Why:** Legitimate guests may share an IP address, and a lower threshold could block an event’s guests.
- **Rule:** Derive client IP only from metadata supplied by the configured hosting platform; do not trust a client-provided forwarding header.
  **Why:** A visitor can forge request headers unless the trusted proxy boundary is defined.
- **Rule:** Do not retain rate-limit IP data beyond the period needed to enforce the limit unless the owner approves a longer retention period.
  **Why:** IP addresses can identify or single out visitors and should not be kept without a need.
