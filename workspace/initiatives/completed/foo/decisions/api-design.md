---
date: '2026-01-04'
status: proposed
---
# API Design for Bulk Operations

## Context

Users have requested the ability to perform bulk operations on foo resources (bulk delete, bulk update status). We need to decide on the API design pattern for these operations.

## Decision

Implement a dedicated `/api/foo/bulk` endpoint that accepts an array of IDs and an operation type.

## Rationale

- Reduces network overhead compared to multiple individual requests
- Atomic operations ensure consistency
- Clear separation from single-resource endpoints
- Follows patterns established by similar APIs (Stripe, GitHub)

## Alternatives Considered

### Individual requests with Promise.all
Not chosen because: Creates race conditions, harder to handle partial failures, increased network overhead.

### GraphQL mutations
Not chosen because: Would require adding GraphQL infrastructure to a REST-only project.

### PATCH with array body on collection endpoint
Not chosen because: Less explicit, mixes concerns with filtering operations.

## Consequences

### Positive
- Clean, explicit API design
- Easy to add new bulk operations
- Better error handling for partial failures
- Reduced API calls from client

### Negative
- Additional endpoint to maintain
- Need to handle large batch limits
- Transaction size considerations for very large batches
