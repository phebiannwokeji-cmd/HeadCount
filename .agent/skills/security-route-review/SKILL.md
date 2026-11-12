---
name: security-route-review
description: Reviews changes to server actions, handlers, and data loaders that read or change HeadCount events or RSVPs.
---

# Review an event or RSVP route

1. Read the task’s relevant PRD sections and AGENTS.md.
2. Identify the changed entry point. Trace it through server code to each Prisma operation and response.
3. Record which actor can reach the entry point, which event or RSVP records it reads or changes, and which fields it returns.
4. Compare that trace with the applicable rules in security-rules.md, capacity-rules.md, data-rules.md, product-rules.md, and tech-rules.md. Record each mismatch with its source file and rule.
5. Prepare checks from test-rules.md. Separate checks that do not use the database from checks the owner must run.
6. Follow AGENTS.md for database, schema, migration, and test-command boundaries. Stop at the required owner handoff when a check or change crosses one.
7. Report the entry point, traced files, rules checked, checks completed, owner-run checks, and unresolved issues.