# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within RAG Chat extension, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to include in your report

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

- We will acknowledge receipt of your vulnerability report within 3 business days
- We will send you regular updates about our progress
- If you have followed the instructions above, we will not take any legal action against you regarding the report
- We will handle your report with strict confidentiality, and not pass on your personal details to third parties without your permission
- We will keep you informed of the progress towards resolving the problem
- In the public disclosure, we will give you credit for the discovery unless you prefer to stay anonymous

## Security Best Practices

When using the RAG Chat extension:

1. **Webhook URL Security**: Always use HTTPS endpoints for webhook URLs
2. **SSL Validation**: Keep SSL certificate validation enabled in production environments
3. **Sensitive Data**: Avoid sending sensitive information through the chat interface
4. **Access Control**: Ensure your webhook endpoint has proper authentication and authorization
5. **Network Security**: Use VPNs or secure networks when connecting to internal RAG services
6. **Configuration**: Store webhook URLs and sensitive configuration in secure VS Code settings or environment variables
7. **Updates**: Keep the extension updated to receive security patches

## Known Security Considerations

### Data Transmission
- All queries are sent to the configured webhook URL
- Code snippets and file paths may be included in requests
- Ensure your webhook endpoint is secured with proper authentication

### SSL/TLS
- The extension supports disabling SSL validation for development purposes
- **Never** disable SSL validation in production environments
- Use properly signed certificates for your webhook endpoints

### Workspace Context
- The extension may include file paths and line numbers from your workspace
- Review the `ragChat.includeContext` setting to control what context is shared
- Be mindful of sharing proprietary code paths

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Users will be notified through:

- GitHub Security Advisories
- Release notes
- Email notifications (if subscribed to repository notifications)

## Additional Resources

- [VS Code Extension Security Best Practices](https://code.visualstudio.com/api/references/extension-guidelines#security)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
