# Security Validation Skill

This skill teaches the agent how to perform thorough security validation of specifications, plans, and implementations.

## When to Apply

Apply this skill when:
- Reviewing a specification for security requirements
- Validating implementation against security rules
- Conducting a security-focused code review
- Assessing a feature's security posture

## Security Validation Framework

### Authentication & Authorization

| Check | Rule | Severity |
|-------|------|----------|
| All sensitive endpoints require authentication | AUTH-001 | Critical |
| Industry-standard auth mechanism (OAuth2, OIDC, SAML) | AUTH-001 | Critical |
| No credentials stored in plain text | AUTH-001 | Critical |
| RBAC implemented with least privilege | AUTH-002 | High |
| Authorization on every request (not UI-only) | AUTH-002 | High |
| Secure session tokens with timeout | AUTH-003 | High |

### Data Protection

| Check | Rule | Severity |
|-------|------|----------|
| Sensitive data encrypted at rest (AES-256+) | DATA-001 | Critical |
| Encryption keys in secure vault (HSM, Key Vault) | DATA-001 | Critical |
| TLS 1.2+ for all communications | DATA-002 | Critical |
| No sensitive data in URLs | DATA-002 | High |
| Input validation on all user inputs | DATA-003 | Critical |
| Output encoding (XSS prevention) | DATA-003 | Critical |
| Parameterized queries (SQL injection prevention) | DATA-003 | Critical |

### API Security

| Check | Rule | Severity |
|-------|------|----------|
| All inputs validated (type, length, format) | API-001 | Critical |
| Request size limits enforced | API-001 | Medium |
| Rate limiting on all endpoints | API-002 | High |
| Brute force protection on auth | API-002 | Critical |
| No stack traces in error responses | API-003 | High |
| Detailed errors server-side only | API-003 | Medium |

### Infrastructure

| Check | Rule | Severity |
|-------|------|----------|
| Secrets in secure vault | INFRA-001 | Critical |
| No secrets in source code | INFRA-001 | Critical |
| Security events logged | INFRA-002 | High |
| No sensitive data in logs | INFRA-002 | High |
| Dependencies scanned for vulns | INFRA-003 | High |

### OWASP Top 10

Check each item systematically:
1. Injection vulnerabilities
2. Broken authentication
3. Sensitive data exposure
4. XXE attacks
5. Broken access control
6. Security misconfiguration
7. XSS vulnerabilities
8. Insecure deserialization
9. Known vulnerable components
10. Insufficient logging

## Report Format

Mark each rule:
- ✅ **Compliant** - Rule fully addressed
- ⚠️ **Partial** - Needs improvement
- ❌ **Non-Compliant** - Blocking issue
- ➖ **N/A** - Does not apply

## For Specifications

Verify security requirements are:
- Documented and specific
- Covering all relevant categories above
- Having testable acceptance criteria
- Not leaking implementation details

## For Implementation

Verify that code:
- Implements documented security controls
- Handles edge cases securely
- Follows secure coding practices
- Has security-focused tests
