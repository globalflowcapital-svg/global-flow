---
name: Replit managed PostgreSQL + autoscale deployments
description: Internal PostgreSQL hostname (helium) is unreachable from Cloud Run autoscale; must use Reserved VM.
---

Replit's managed PostgreSQL resolves to an internal Docker network IP (e.g. `172.24.0.3`) via the hostname `helium`. This hostname is only resolvable from:
- The Replit dev container
- Reserved VM deployments (which run inside Replit's internal network)

It is NOT reachable from autoscale (Cloud Run) deployments, causing `getaddrinfo EAI_AGAIN helium` errors on every DB query in production.

**Why:** Cloud Run containers run on Google's external infrastructure, outside Replit's internal Docker network. The `helium` hostname has no public DNS record and no public IP.

**How to apply:** Any project using Replit managed PostgreSQL that deploys to production must use Reserved VM (Always On) deployment type, not Autoscale. Tell the user to switch in the Deployments pane → Settings → change type → re-publish.
