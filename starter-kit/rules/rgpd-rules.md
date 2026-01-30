# RGPD/GDPR Validation Rules

These rules are used by Spec-Kit to validate GDPR compliance after specification or implementation phases.

> **Customization**: Edit this file to match your organization's data protection policies and local regulations.

---

## Data Identification

### RGPD-001: Personal Data Inventory
- [ ] All personal data collected is identified and documented
- [ ] Data categories are classified (standard, sensitive, special)
- [ ] Data sources are documented (user input, API, third-party)

### RGPD-002: Data Mapping
- [ ] Data flow is documented (collection → processing → storage → deletion)
- [ ] All data processors are identified
- [ ] Cross-border transfers documented (if applicable)

---

## Legal Basis (Article 6)

### RGPD-010: Lawful Processing
- [ ] Legal basis for each processing activity is documented
  - [ ] Consent (freely given, specific, informed, unambiguous)
  - [ ] Contract execution
  - [ ] Legal obligation
  - [ ] Vital interests
  - [ ] Public interest
  - [ ] Legitimate interests (with balancing test)

### RGPD-011: Consent Management
- [ ] Consent is obtained before processing (if consent-based)
- [ ] Consent can be withdrawn as easily as given
- [ ] Consent records are maintained
- [ ] Age verification for minors (< 16 years)

---

## Data Subject Rights (Articles 12-22)

### RGPD-020: Right to Information (Art. 13-14)
- [ ] Privacy notice provided at data collection
- [ ] Purpose of processing clearly stated
- [ ] Data retention period communicated
- [ ] Third-party sharing disclosed

### RGPD-021: Right of Access (Art. 15)
- [ ] Users can request copy of their data
- [ ] Response within 30 days
- [ ] Data provided in machine-readable format

### RGPD-022: Right to Rectification (Art. 16)
- [ ] Users can correct inaccurate data
- [ ] Users can complete incomplete data
- [ ] Updates propagated to third parties

### RGPD-023: Right to Erasure / RTBF (Art. 17)
- [ ] Users can request data deletion
- [ ] Deletion includes backups (within reasonable time)
- [ ] Third parties notified of erasure requests
- [ ] Exceptions documented (legal retention, public interest)

### RGPD-024: Right to Data Portability (Art. 20)
- [ ] Data exportable in structured format (JSON, CSV)
- [ ] Direct transfer to another controller (if feasible)

### RGPD-025: Right to Object (Art. 21)
- [ ] Users can object to processing
- [ ] Objection mechanism easily accessible
- [ ] Processing stops unless compelling grounds exist

---

## Data Protection Principles

### RGPD-030: Data Minimization
- [ ] Only necessary data collected
- [ ] No "nice to have" data collection
- [ ] Optional fields clearly marked

### RGPD-031: Purpose Limitation
- [ ] Data used only for stated purposes
- [ ] New purposes require new consent/basis
- [ ] No data repurposing without user knowledge

### RGPD-032: Storage Limitation
- [ ] Retention periods defined for each data type
- [ ] Automatic deletion after retention period
- [ ] Archival vs. active data distinguished

### RGPD-033: Accuracy
- [ ] Data kept up-to-date
- [ ] Users can update their data
- [ ] Inaccurate data corrected promptly

---

## Security Measures (Article 32)

### RGPD-040: Technical Measures
- [ ] Encryption at rest and in transit
- [ ] Pseudonymization where possible
- [ ] Access controls implemented
- [ ] Regular security testing

### RGPD-041: Organizational Measures
- [ ] Staff trained on data protection
- [ ] Data protection policies documented
- [ ] Incident response procedures in place

---

## Third Parties & Processors

### RGPD-050: Processor Agreements (Art. 28)
- [ ] DPA (Data Processing Agreement) with all processors
- [ ] Processor security measures verified
- [ ] Sub-processors documented and approved

### RGPD-051: International Transfers
- [ ] Adequacy decision exists (for destination country)
- [ ] Standard Contractual Clauses (SCCs) in place
- [ ] Supplementary measures if required

---

## Documentation & Accountability

### RGPD-060: Records of Processing (Art. 30)
- [ ] Processing activities documented
- [ ] ROPA (Record of Processing Activities) maintained
- [ ] Available for supervisory authority

### RGPD-061: DPIA (Art. 35)
- [ ] DPIA required? (high-risk processing)
- [ ] DPIA completed if required
- [ ] Residual risks documented and accepted

---

## Validation Instructions

When validating against these rules:

1. **For Specifications**: Verify that data protection requirements are documented and RGPD compliance is designed-in
2. **For Implementation**: Verify that code implements data protection measures and user rights mechanisms
3. **Mark Status**:
   - ✅ **Compliant**: Rule is fully addressed
   - ⚠️ **Partial**: Rule is partially addressed, needs improvement
   - ❌ **Non-Compliant**: Rule is not addressed, blocking issue
   - ➖ **N/A**: Rule does not apply to this feature

## Report Format

```markdown
## RGPD Compliance Report

**Feature**: {feature_name}
**Date**: {date}
**Phase**: {spec|implementation}
**DPO Review Required**: {yes|no}

### Data Inventory
| Data Type | Category | Legal Basis | Retention | Processors |
|-----------|----------|-------------|-----------|------------|
| email     | Personal | Consent     | 2 years   | SendGrid   |

### Summary
- Compliant: X rules
- Partial: X rules
- Non-Compliant: X rules
- N/A: X rules

### Findings

#### Critical Issues (Blocking)
{list blocking compliance issues}

#### Warnings
{list partial compliance items}

#### Recommendations
{list improvements for future}
```
