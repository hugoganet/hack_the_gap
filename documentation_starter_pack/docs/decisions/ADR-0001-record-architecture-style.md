# ADR-0001: Record architecture style

Date: 2025-10-26
Status: Accepted
Deciders: solo-founder

## Context

We need a consistent architecture style to guide early decisions. The product is a web app with API and persistence.

## Decision

Adopt a service-oriented modular monolith initially, with a clear separation between web, API, and data layers. Use ADRs to capture changes.

## Consequences

- Faster delivery early with low operational overhead
- Clear seams for later extraction if scale demands it
- Requires discipline to keep boundaries clean

## Alternatives Considered

- Microservices: premature complexity
- Single-page app with BFF: compatible later, not required now

## Links

- System overview: ../architecture.md
- Sessions: ../ai_sessions/2025-10-26-session-001.md
