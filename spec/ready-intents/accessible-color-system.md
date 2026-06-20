---
name: accessible-color-system
description: Fresh accessible palette with legible text, clear hierarchy, and distinguishable semantic/focus states across light, dark, and system modes.
---

# Accessible color system

Target: groceries-client only.

## Goal

Establish an accessible visual system across light, dark, and system modes:
legible text, clear visual hierarchy, and semantic and focus states that are
distinguishable without relying on color alone.

## Problems

- Current colors, contrast, and visual weight lack hierarchy across text, links, controls, cards, and borders.
- Both themes need legible text and visibly distinct interactive states.

## Decisions

- Select a fresh accessible palette using engineering judgment.
- Preserve distinguishable semantic success and destructive states.
- Apply consistent hierarchy to text, links, controls, cards, and borders.
- Make semantic and focus states distinguishable without color alone.

## Acceptance

- Light and dark themes both render legible text and visible interactive states.
- Success and destructive states remain semantically distinguishable.
- Focus and semantic states are distinguishable without color alone (e.g. shape, weight, outline, or icon).
- Text, links, controls, cards, and borders read with a clear visual hierarchy.

## Out of scope

- The login page.
- API request/response contracts.
- `data-test-id` selectors.
- Adding navigation destinations.

## Prerequisites

- Theme resolution for light, dark, and system modes is implemented and exposes a resolved theme to styling.
