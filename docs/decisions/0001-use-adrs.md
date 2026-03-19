# 1. Use ADRs for Architectural Decisions

Date: 2026-03-19

## Status

Accepted

## Context

We need to document architectural decisions so future developers understand why things were built this way. Without this documentation, decisions get questioned repeatedly, and context is lost when team members change.

## Decision

Use Architecture Decision Records (ADRs) following the Michael Nygard format. Each ADR captures:
- The context and problem
- The decision made
- The consequences (both positive and negative)

## Consequences

- **Good**: Decisions are documented with context
- **Good**: Easy to find and reference specific decisions
- **Good**: New team members can understand historical choices
- **Trade-off**: Requires discipline to create ADRs for significant decisions
- **Trade-off**: Adds overhead to decision-making process
