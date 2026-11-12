---
name: supabase-weekly-export
description: Guides the owner through HeadCount’s recurring Supabase database export and, when requested, its pre-pilot restore check.
---

# Guide a Supabase export

1. Read AGENTS.md, free-tier-rules.md, tech-rules.md, security-rules.md, and test-rules.md.
2. Confirm the Supabase project reference and the owner’s chosen export destination. If either is missing, ask for it before preparing a command.
3. Check the installed Supabase CLI version and the help for its database dump command. If the CLI is unavailable or the command is unsupported, report the prerequisite and stop.
4. Prepare the exact export command for the confirmed project and destination. Follow the project’s secret-handling rules.
5. Give the command to the owner to run. Wait for the owner to report its result.
6. Check that the reported export file exists, is non-empty, and has a recent timestamp. Do not inspect its database contents.
7. Ask the owner to confirm that the export is stored off-site. Report the date, destination, and whether the export is confirmed.

# Guide the pre-pilot restore check

1. Confirm the owner wants to run the restore check and has selected a disposable Supabase project.
2. Prepare the restore command for that disposable project, following the current Supabase CLI help and the project’s rules.
3. Give the command to the owner to run. Wait for the owner to confirm the result.
4. Ask the owner to confirm that the restored schema and records can be read.
5. Report whether the restore check passed or remains pending. Do not connect to or alter the real pilot project.