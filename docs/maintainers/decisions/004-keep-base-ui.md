# ADR 004: Keep Base UI (shadcn base-nova)

- **Status:** accepted (2026-11-08)

## Context

Upstream ships shadcn/ui in the `base-nova` style on Base UI (`@base-ui/react`). Many shadcn examples and
Figma kits assume Radix.

## Decision

Keep Base UI. New brand sections use the primitives already in `components/ui/` (Accordion, Sheet, Dialog,
Button, Badge, Select…). Do not add Radix packages.

## Consequences

- No duplicate primitive libraries, smaller bundles, and upstream component updates merge cleanly.
- When porting a Radix-based snippet, adapt it to the Base UI API (for example `render` instead of `asChild`).
