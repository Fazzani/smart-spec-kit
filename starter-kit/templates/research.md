# Technical Research: [TOPIC]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Author**: [Name/AI]

---

## Context

### Problem Statement

[TO FILL: What technical decision needs to be made?]

### Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| [Requirement 1] | Must Have | |
| [Requirement 2] | Should Have | |
| [Requirement 3] | Nice to Have | |

### Constraints

- [Constraint 1: e.g., Must work with existing PostgreSQL]
- [Constraint 2: e.g., Bundle size < 100KB]
- [Constraint 3: e.g., Must support TypeScript]

---

## Options Evaluated

### Option 1: [Name]

**Description**: [Brief description]

| Criteria | Score | Notes |
|----------|-------|-------|
| Performance | ⭐⭐⭐⭐⬜ | [Details] |
| Documentation | ⭐⭐⭐⭐⭐ | [Details] |
| Community/Support | ⭐⭐⭐⬜⬜ | [Details] |
| Bundle Size | ⭐⭐⭐⭐⬜ | [Size in KB] |
| Learning Curve | ⭐⭐⭐⭐⭐ | [Details] |
| TypeScript Support | ⭐⭐⭐⭐⭐ | [Native/Types available] |

**Pros**:
- [Pro 1]
- [Pro 2]

**Cons**:
- [Con 1]
- [Con 2]

**Links**:
- Documentation: [URL]
- GitHub: [URL]
- npm: [URL]

---

### Option 2: [Name]

**Description**: [Brief description]

| Criteria | Score | Notes |
|----------|-------|-------|
| Performance | ⭐⭐⭐⬜⬜ | [Details] |
| Documentation | ⭐⭐⭐⭐⬜ | [Details] |
| Community/Support | ⭐⭐⭐⭐⭐ | [Details] |
| Bundle Size | ⭐⭐⬜⬜⬜ | [Size in KB] |
| Learning Curve | ⭐⭐⭐⬜⬜ | [Details] |
| TypeScript Support | ⭐⭐⭐⭐⬜ | [Details] |

**Pros**:
- [Pro 1]
- [Pro 2]

**Cons**:
- [Con 1]
- [Con 2]

---

### Option 3: [Name] (if applicable)

[Same structure as above]

---

## Comparison Matrix

| Criteria | Weight | Option 1 | Option 2 | Option 3 |
|----------|--------|----------|----------|----------|
| Performance | 30% | 4/5 | 3/5 | 5/5 |
| Documentation | 20% | 5/5 | 4/5 | 3/5 |
| Community | 15% | 3/5 | 5/5 | 4/5 |
| Bundle Size | 15% | 4/5 | 2/5 | 5/5 |
| Learning Curve | 10% | 5/5 | 3/5 | 2/5 |
| TypeScript | 10% | 5/5 | 4/5 | 4/5 |
| **Weighted Score** | | **4.1** | **3.5** | **4.0** |

---

## Proof of Concept

### Setup

```bash
# Commands to test the chosen option
npm install [package]
```

### Test Code

```typescript
// Minimal example demonstrating the approach
import { Something } from '[package]';

const example = async () => {
  // Test implementation
};
```

### Results

| Test | Expected | Actual | Pass? |
|------|----------|--------|-------|
| [Test 1] | [Expected] | [Actual] | ✅/❌ |
| [Test 2] | [Expected] | [Actual] | ✅/❌ |

---

## Decision

### Choice: [Option Name]

### Rationale

1. **Primary Reason**: [Why this option wins]
2. **Secondary Reason**: [Supporting argument]
3. **Risk Accepted**: [What trade-off we're accepting]

### Trade-offs Accepted

| Trade-off | Mitigation |
|-----------|------------|
| [Trade-off 1] | [How we'll handle it] |
| [Trade-off 2] | [How we'll handle it] |

### Dissenting Opinions

[Document any disagreements or alternative views for future reference]

---

## Implementation Notes

### Integration Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Configuration

```typescript
// Recommended configuration
const config = {
  option1: 'value',
  option2: true,
};
```

### Gotchas / Known Issues

- [Issue 1 and workaround]
- [Issue 2 and workaround]

---

## References

| Resource | URL | Notes |
|----------|-----|-------|
| Official Docs | [URL] | Primary reference |
| Tutorial | [URL] | Good getting started |
| Benchmark | [URL] | Performance comparison |
| GitHub Issues | [URL] | Known issues tracker |

---

## Appendix

### Benchmark Data

[Raw benchmark results if applicable]

### Alternative Approaches Considered but Rejected Early

| Approach | Reason for Rejection |
|----------|---------------------|
| [Approach 1] | [Reason] |
| [Approach 2] | [Reason] |
