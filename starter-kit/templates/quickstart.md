# Quickstart Validation: [FEATURE NAME]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link to spec.md]

---

## Purpose

This document provides **manual validation scenarios** to verify the feature works correctly.
Use these scenarios for:
- Developer self-testing during implementation
- QA acceptance testing
- Demo preparation
- Stakeholder validation

---

## Prerequisites

### Environment Setup

| Requirement | How to Verify |
|-------------|---------------|
| Server running | `curl http://localhost:3000/health` returns 200 |
| Database seeded | [Command or verification step] |
| Test users created | [List test accounts] |

### Test Accounts

| User | Email | Password | Role |
|------|-------|----------|------|
| Alice | alice@test.com | test123 | Admin |
| Bob | bob@test.com | test123 | User |

---

## Validation Scenarios

### Scenario 1: [Happy Path - Primary Use Case]

> **User Story**: US001 - [Story title from spec]
> **Priority**: 🔴 Critical

**Steps**:
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Expected Result**:
- [ ] [Specific observable outcome]
- [ ] [Data state verification]

**Verify**:
```bash
# Optional: API/DB verification command
curl http://localhost:3000/api/resource
```

---

### Scenario 2: [Secondary Use Case]

> **User Story**: US002 - [Story title]
> **Priority**: 🟡 High

**Steps**:
1. [Action 1]
2. [Action 2]

**Expected Result**:
- [ ] [Outcome]

---

### Scenario 3: [Edge Case]

> **User Story**: US001 - Edge case
> **Priority**: 🟢 Medium

**Precondition**: [Special setup required]

**Steps**:
1. [Action 1]
2. [Action 2]

**Expected Result**:
- [ ] [Outcome]

---

### Scenario 4: [Error Handling]

> **User Story**: US003 - Error handling
> **Priority**: 🟡 High

**Steps**:
1. [Trigger error condition]
2. [Observe behavior]

**Expected Result**:
- [ ] Error message displayed: "[Expected message]"
- [ ] No data corruption
- [ ] User can recover

---

## Negative Test Scenarios

### Invalid Input

| Input | Action | Expected |
|-------|--------|----------|
| Empty field | Submit form | Validation error shown |
| Too long text | Enter 1000 chars | Truncated or rejected |
| SQL injection | Enter `'; DROP TABLE--` | Escaped, no error |

### Unauthorized Access

| Scenario | Expected |
|----------|----------|
| Access without login | Redirect to login |
| Access other user's data | 403 Forbidden |
| Expired token | 401, prompt re-login |

---

## Performance Validation

| Scenario | Threshold | How to Test |
|----------|-----------|-------------|
| Page load | < 2 seconds | Browser DevTools |
| API response | < 500ms | `time curl ...` |
| List 100 items | < 1 second | Seed DB, measure |

---

## Cross-Browser/Device Testing

| Platform | Status | Notes |
|----------|--------|-------|
| Chrome (latest) | ⬜ | |
| Firefox (latest) | ⬜ | |
| Safari (latest) | ⬜ | |
| Mobile (iOS) | ⬜ | |
| Mobile (Android) | ⬜ | |

---

## Validation Summary

| Scenario | Status | Tester | Date |
|----------|--------|--------|------|
| Scenario 1: [Name] | ⬜ Pending | | |
| Scenario 2: [Name] | ⬜ Pending | | |
| Scenario 3: [Name] | ⬜ Pending | | |
| Scenario 4: [Name] | ⬜ Pending | | |

### Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | ⬜ |
| QA | | | ⬜ |
| Product Owner | | | ⬜ |

---

## Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| [Issue 1] | [Cause] | [Fix] |
| [Issue 2] | [Cause] | [Fix] |

### Debug Commands

```bash
# Check server logs
tail -f logs/app.log

# Verify database state
psql -c "SELECT * FROM [table] LIMIT 5"

# Reset test environment
npm run db:reset && npm run db:seed
```
