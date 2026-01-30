# Security Validation Rules

These rules are used by Spec-Kit to validate security compliance after specification or implementation phases.

> **Customization**: Edit this file to match your organization's security policies.

---

## Authentication & Authorization

### AUTH-001: Authentication Required
- [ ] All endpoints accessing sensitive data require authentication
- [ ] Authentication mechanism is industry-standard (OAuth2, OIDC, SAML)
- [ ] No credentials stored in plain text

### AUTH-002: Authorization Controls
- [ ] Role-based access control (RBAC) implemented
- [ ] Principle of least privilege applied
- [ ] Authorization checked on every request (not just UI)

### AUTH-003: Session Management
- [ ] Session tokens are cryptographically secure
- [ ] Session timeout implemented
- [ ] Session invalidation on logout

---

## Data Protection

### DATA-001: Data at Rest
- [ ] Sensitive data encrypted at rest (AES-256 or equivalent)
- [ ] Encryption keys managed securely (HSM, Key Vault)
- [ ] Database credentials not hardcoded

### DATA-002: Data in Transit
- [ ] TLS 1.2+ required for all communications
- [ ] Certificate validation enabled
- [ ] No sensitive data in URLs

### DATA-003: Data Sanitization
- [ ] Input validation on all user inputs
- [ ] Output encoding to prevent XSS
- [ ] Parameterized queries to prevent SQL injection

---

## API Security

### API-001: Input Validation
- [ ] All inputs validated (type, length, format, range)
- [ ] Request size limits enforced
- [ ] File upload restrictions (type, size)

### API-002: Rate Limiting
- [ ] Rate limiting implemented on all endpoints
- [ ] Brute force protection on authentication
- [ ] DDoS mitigation considered

### API-003: Error Handling
- [ ] No stack traces exposed to users
- [ ] Generic error messages for security failures
- [ ] Detailed errors logged server-side only

---

## Infrastructure

### INFRA-001: Secrets Management
- [ ] Secrets stored in secure vault (Azure Key Vault, AWS Secrets Manager)
- [ ] No secrets in source code or config files
- [ ] Secrets rotated regularly

### INFRA-002: Logging & Monitoring
- [ ] Security events logged (auth failures, access denied)
- [ ] No sensitive data in logs
- [ ] Logs protected from tampering

### INFRA-003: Dependencies
- [ ] Dependencies scanned for vulnerabilities
- [ ] Regular security updates applied
- [ ] No known vulnerable dependencies

---

## Compliance Checks

### COMP-001: OWASP Top 10
- [ ] Injection vulnerabilities addressed
- [ ] Broken authentication prevented
- [ ] Sensitive data exposure mitigated
- [ ] XXE attacks prevented
- [ ] Broken access control fixed
- [ ] Security misconfiguration avoided
- [ ] XSS vulnerabilities prevented
- [ ] Insecure deserialization handled
- [ ] Components with known vulnerabilities updated
- [ ] Insufficient logging addressed

---

## Validation Instructions

When validating against these rules:

1. **For Specifications**: Verify that security requirements are documented and address each applicable rule
2. **For Implementation**: Verify that code implements the security controls described in the specification
3. **Mark Status**:
   - ✅ **Compliant**: Rule is fully addressed
   - ⚠️ **Partial**: Rule is partially addressed, needs improvement
   - ❌ **Non-Compliant**: Rule is not addressed, blocking issue
   - ➖ **N/A**: Rule does not apply to this feature

## Report Format

```markdown
## Security Validation Report

**Feature**: {feature_name}
**Date**: {date}
**Phase**: {spec|implementation}

### Summary
- Compliant: X rules
- Partial: X rules
- Non-Compliant: X rules
- N/A: X rules

### Findings

#### Critical Issues
{list critical non-compliant items}

#### Warnings
{list partial compliance items}

#### Recommendations
{list improvements}
```
