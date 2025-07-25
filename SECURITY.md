# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of OpenChat seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:
- Email: security@open-chat.us
- GitHub Security Advisory: https://github.com/michelbr84/neon-chat-pulse/security/advisories/new

### What to include

Please include the following information:
- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

- **Acknowledgment**: Within 24-48 hours
- **Initial Response**: Within 72 hours with preliminary assessment
- **Resolution**: Critical issues within 7 days, others within 30 days

## Security Features

OpenChat implements multiple layers of security:

- **Input Sanitization**: All user inputs are sanitized using DOMPurify
- **Content Security Policy**: Strict CSP headers prevent XSS attacks
- **Rate Limiting**: Protection against spam and abuse
- **Row Level Security**: Database access controlled via Supabase RLS
- **Authentication**: Secure authentication flow via Supabase Auth
- **HTTPS**: All traffic encrypted in transit
- **No Sensitive Data**: No passwords or sensitive data stored in frontend

## Security Headers

The application implements the following security headers:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## Data Privacy

- No tracking or analytics beyond basic usage metrics
- Guest users are not linked to personally identifiable information
- All data processing complies with privacy-first principles
- Open source codebase allows for full transparency

## Third-Party Dependencies

We regularly update dependencies and monitor for security vulnerabilities using automated tools.

## Responsible Disclosure

We appreciate security researchers who responsibly disclose vulnerabilities and will acknowledge their contributions in our security advisories when appropriate.