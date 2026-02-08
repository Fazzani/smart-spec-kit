# API Design Skill

This skill teaches the agent how to design high-quality API contracts following best practices, including REST endpoints, event systems, and data models.

## When to Apply

Apply this skill when:
- Designing API endpoints from specifications
- Creating OpenAPI 3.0 contracts
- Defining event systems (WebSocket/SSE)
- Designing data models and entity relationships
- Reviewing API designs for completeness

## API Contract Design (OpenAPI 3.0)

### Endpoint Design Principles

1. **Resource-oriented URLs**: Use nouns, not verbs
   - ✅ `GET /users/{id}/orders`
   - ❌ `GET /getUserOrders`

2. **HTTP methods semantic accuracy**:
   - `GET` - Read (idempotent)
   - `POST` - Create
   - `PUT` - Full replace (idempotent)
   - `PATCH` - Partial update
   - `DELETE` - Remove (idempotent)

3. **Consistent response structure**:
   ```json
   {
     "data": {},
     "meta": { "total": 100, "page": 1 },
     "errors": []
   }
   ```

4. **Proper status codes**:
   - `200` OK, `201` Created, `204` No Content
   - `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found
   - `409` Conflict, `422` Unprocessable Entity
   - `500` Internal Server Error

### Required for Each Endpoint

- Path and method
- Request body schema (with validation rules)
- Response schemas (success + error)
- Authentication requirements
- Rate limiting info
- Query parameters for filtering/pagination/sorting

### Pagination Pattern

```yaml
parameters:
  - name: page
    in: query
    schema: { type: integer, minimum: 1, default: 1 }
  - name: limit
    in: query
    schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
  - name: sort
    in: query
    schema: { type: string, pattern: "^[a-zA-Z_]+(:(asc|desc))?$" }
```

### Error Response Schema

```yaml
ErrorResponse:
  type: object
  required: [code, message]
  properties:
    code:
      type: string
      description: Machine-readable error code
    message:
      type: string
      description: Human-readable message
    details:
      type: array
      items:
        type: object
        properties:
          field: { type: string }
          message: { type: string }
```

## Data Model Design

### Entity Definition

For each entity, define:
- Field name, type, constraints
- Required vs optional
- Default values
- Validation rules (min, max, pattern, enum)
- Relationships (1:1, 1:N, N:N)
- Indexes for performance

### Relationship Patterns

- **1:1**: Embed or separate table based on access patterns
- **1:N**: Foreign key on the "many" side
- **N:N**: Junction table with composite key
- **Self-referencing**: Parent-child with nullable FK

## Event System Design (WebSocket/SSE)

### Event Contract Structure

For each event:
- Event name (namespaced: `resource.action`)
- Direction (client→server, server→client, bidirectional)
- Payload schema
- Trigger conditions
- Error events

### Reconnection Strategy

Always define:
- Reconnection backoff (exponential with jitter)
- State recovery mechanism
- Missed event handling
- Connection timeout

## Quickstart Validation Scenarios

Convert each user story from the spec into a manual test scenario:

```markdown
### Scenario: [User Story Title]
**User Story**: [US###]
**Prerequisites**: [What must be set up]

1. **Step 1**: [Action]
   - **Expected**: [Observable result]
2. **Step 2**: [Action]
   - **Expected**: [Observable result]

**Success Criteria**: [How to know it works]
```

## Visualization

When explaining API designs, generate diagrams:
- Sequence diagrams for complex multi-step flows
- Entity-relationship diagrams for data models
- Component diagrams for service architecture
