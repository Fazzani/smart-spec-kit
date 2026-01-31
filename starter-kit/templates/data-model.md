# Data Model: [FEATURE NAME]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link to spec.md]

---

## Overview

[TO FILL: Brief description of the data model scope and purpose]

---

## Entities

### Entity: [EntityName]

> [Brief description of the entity's purpose]

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | Yes | auto | Primary key |
| created_at | datetime | Yes | now() | Creation timestamp |
| updated_at | datetime | Yes | now() | Last update timestamp |
| [field] | [type] | [Yes/No] | [value] | [description] |

**Constraints**:
- `id` is immutable after creation
- [TO FILL: Additional constraints]

**Indexes**:
- PRIMARY KEY (`id`)
- [TO FILL: Additional indexes]

---

### Entity: [EntityName2]

> [Brief description]

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | Yes | auto | Primary key |
| [field] | [type] | [Yes/No] | [value] | [description] |

---

## Relations

```text
┌─────────────┐         ┌─────────────┐
│   Entity1   │────────▶│   Entity2   │
└─────────────┘   1:N   └─────────────┘
```

| Relation | Type | Description |
|----------|------|-------------|
| Entity1 → Entity2 | 1:N | [Description] |
| Entity2 ↔ Entity3 | N:N | [Description, via junction table] |

### Junction Tables (if N:N relations)

#### [JunctionTableName]

| Field | Type | Description |
|-------|------|-------------|
| entity1_id | UUID | FK to Entity1 |
| entity2_id | UUID | FK to Entity2 |
| created_at | datetime | When relation was created |

---

## Enums

### [EnumName]

| Value | Description |
|-------|-------------|
| `VALUE_1` | [Description] |
| `VALUE_2` | [Description] |

---

## Validation Rules

### Entity: [EntityName]

| Field | Rule | Error Message |
|-------|------|---------------|
| email | Valid email format | "Invalid email format" |
| name | 1-100 characters | "Name must be 1-100 chars" |
| [field] | [rule] | [message] |

---

## Data Lifecycle

### Creation

```text
[Describe how entities are created, by whom, validation order]
```

### Updates

```text
[Describe update rules, what can/cannot be modified]
```

### Deletion

| Entity | Soft Delete | Cascade | Notes |
|--------|-------------|---------|-------|
| [Entity] | Yes/No | [Related entities] | [Notes] |

---

## Migration Notes

### From Previous Version

[TO FILL: If migrating from existing schema, document changes]

| Change | Migration Strategy |
|--------|-------------------|
| [New field X] | Default value for existing records |
| [Renamed field Y] | Rename column, update references |

---

## Sample Data

### [EntityName] Examples

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-31T10:00:00Z",
  "field1": "example value"
}
```

---

## Checklist

### Completeness
- [ ] All entities from spec.md are represented
- [ ] All user story data needs are covered
- [ ] Relations match business logic

### Quality
- [ ] Primary keys defined for all entities
- [ ] Required fields marked
- [ ] Indexes defined for query patterns
- [ ] Validation rules specified

### Consistency
- [ ] Naming conventions followed (snake_case/camelCase)
- [ ] Types are consistent across entities
- [ ] FK references are valid
