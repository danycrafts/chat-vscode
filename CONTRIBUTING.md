# Contributing to RAG Chat

Thank you for your interest in contributing to RAG Chat! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- VS Code 1.85.0 or higher

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/chat-vscode.git
cd chat-vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch
```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to start debugging
3. A new VS Code window will open with the extension loaded
4. Test your changes in this Extension Development Host window

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/your-feature-name` for new features
- `fix/issue-description` for bug fixes
- `docs/documentation-update` for documentation changes
- `refactor/component-name` for refactoring

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(chat): add syntax highlighting for code blocks
fix(webview): resolve issue with file path navigation
docs(readme): update installation instructions
```

## Submitting Changes

### Pull Request Process

1. Update documentation to reflect your changes
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Run the linter: `npm run lint`
5. Update the README.md if needed
6. Submit a pull request with a clear description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have updated the documentation
- [ ] I have added tests
- [ ] All tests pass
- [ ] The linter shows no errors
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Add type annotations for function parameters and return types
- Use interfaces for object shapes

### Code Style

- Use 4 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Maximum line length: 120 characters
- Use trailing commas in multi-line objects and arrays

### ESLint

The project uses ESLint for code quality. Run the linter:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

## Testing

### Writing Tests

- Place tests in the `src/test/suite` directory
- Name test files with `.test.ts` extension
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

Example:
```typescript
test('Should parse file reference correctly', () => {
    // Arrange
    const reference = 'src/file.ts:42';

    // Act
    const result = parseFileReference(reference);

    // Assert
    assert.strictEqual(result.file, 'src/file.ts');
    assert.strictEqual(result.line, 42);
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run watch
```

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex logic with inline comments
- Keep comments up-to-date with code changes

Example:
```typescript
/**
 * Queries the RAG endpoint with the provided parameters
 * @param webhookUrl - The webhook URL to send the request to
 * @param requestParams - The request parameters including query and optional context
 * @param timeout - Request timeout in milliseconds
 * @returns Promise resolving to the RAG response
 */
private queryRag(
    webhookUrl: string,
    requestParams: Record<string, any>,
    timeout: number
): Promise<RagResponse> {
    // Implementation
}
```

### README Updates

Update the README.md when:
- Adding new features
- Changing configuration options
- Modifying installation steps
- Adding new dependencies

## Questions?

If you have questions or need help:
- Open an issue with the `question` label
- Check existing issues and pull requests
- Review the project documentation

## License

By contributing to RAG Chat, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to RAG Chat!
