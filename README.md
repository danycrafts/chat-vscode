# RAG Chat for VS Code

[![CI](https://github.com/danycrafts/chat-vscode/workflows/CI/badge.svg)](https://github.com/danycrafts/chat-vscode/actions/workflows/ci.yml)
[![Release](https://github.com/danycrafts/chat-vscode/workflows/Release/badge.svg)](https://github.com/danycrafts/chat-vscode/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-blue.svg)](https://code.visualstudio.com/)

A Visual Studio Code extension that provides a chat interface for querying RAG (Retrieval-Augmented Generation) enabled code repositories.

## Features

- **Chat Interface**: Interactive sidebar chat interface for asking questions about your code
- **Smart Context Sharing**: Automatically includes current file path and line number context in queries
- **Enhanced Source References**:
  - Clickable file:line references anywhere in chat messages (e.g., `src/file.ts:42`)
  - Copy-to-clipboard functionality for easy reference sharing
  - Improved visual design with hover effects
- **Flexible Request Parameters**:
  - Optional query and collection parameters
  - Support for custom additional parameters
  - Automatic context inclusion (file path, line numbers)
- **Configurable Endpoint**: Easy configuration of webhook URL and collection name
- **Syntax Highlighting**: Markdown formatted responses with code highlighting
- **Context Retention**: Chat history is preserved while the view is open
- **Security**: SSL certificate validation, configurable timeouts, and secure parameter handling

## Installation

### From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Press `F5` in VS Code to open a new window with the extension loaded

### Building VSIX Package

To create a distributable package:

```bash
npm install -g @vscode/vsce
vsce package
```

Then install the `.vsix` file via:
- Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
- Select "Extensions: Install from VSIX..."

## Configuration

Configure the extension through VS Code settings:

1. Open Settings (`Cmd+,` / `Ctrl+,`)
2. Search for "RAG Chat"
3. Configure the following options:

### Available Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `ragChat.webhookUrl` | The webhook URL endpoint for RAG queries | `https://localhost:5678/webhook-test/rag-chat` |
| `ragChat.collection` | The collection name to query | `jenkins-git-repo` |
| `ragChat.timeout` | Request timeout in milliseconds | `30000` |
| `ragChat.validateSSL` | Validate SSL certificates for HTTPS requests | `true` |
| `ragChat.includeContext` | Include current file path and line number in queries | `true` |
| `ragChat.additionalParams` | Additional parameters to include in every request (JSON object) | `{}` |

### Example settings.json

```json
{
  "ragChat.webhookUrl": "https://your-server.com/webhook/rag-chat",
  "ragChat.collection": "your-collection-name",
  "ragChat.timeout": 30000,
  "ragChat.validateSSL": true,
  "ragChat.includeContext": true,
  "ragChat.additionalParams": {
    "model": "gpt-4",
    "temperature": 0.7
  }
}
```

## Usage

### Opening the Chat

1. **Via Activity Bar**: Click the chat icon in the Activity Bar (left sidebar)
2. **Via Command Palette**:
   - Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
   - Run `RAG Chat: Open RAG Chat`

### Asking Questions

1. Type your question in the input field at the bottom of the chat panel
2. Press `Enter` or click the "Send" button
3. Wait for the response (a "Thinking..." indicator will appear)
4. Review the answer and source references

### Navigating to Sources

When the response includes source references:

1. Look for the "Sources" section below the answer
2. Click on any source file reference to open the file
3. The file will open automatically at the specified line range
4. The relevant lines will be highlighted

### Using File References

The extension automatically detects file references in chat messages:

- **Format**: `path/to/file.ext:line` or `path/to/file.ext:start-end`
- **Examples**:
  - `src/extension.ts:42` (single line)
  - `src/chatViewProvider.ts:100-150` (line range)
- **Click** any reference to jump to that location
- **Copy** references from the Sources section with one click

### Example Queries

- "Is this unit test really covering the usecases of its feature AsyncPeriodicWorkTest?"
- "How does the authentication system work?"
- "Where is the database connection configured?"
- "What are the main dependencies in this project?"

## API Format

### Request Format

The extension sends POST requests with this structure:

```json
{
  "query": "your question here",
  "collection": "collection-name",
  "file_path": "src/extension.ts",
  "line_number": 42,
  "start_line": 40,
  "end_line": 50
}
```

**Parameters:**
- `query` (required): The user's question
- `collection` (optional): The collection name from settings
- `file_path` (optional): Current file path (when `includeContext` is enabled)
- `line_number` (optional): Current cursor line (when no selection exists)
- `start_line` (optional): Selection start line
- `end_line` (optional): Selection end line
- Additional custom parameters from `ragChat.additionalParams`

### Expected Response Format

The webhook should return JSON in this format:

```json
{
  "answer": "The detailed answer text (markdown supported)",
  "sources": [
    {
      "file": "path/to/file.java",
      "language": "java",
      "lines": "27-35",
      "score": 0.8
    }
  ],
  "sources_count": 10
}
```

### Error Response Format

```json
{
  "code": 404,
  "message": "Error message",
  "hint": "Optional hint for fixing the issue"
}
```

## Development

### Project Structure

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml            # CI pipeline
│   │   └── release.yml       # Release pipeline
│   └── dependabot.yml        # Dependabot configuration
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── chatViewProvider.ts   # Chat webview provider
│   └── test/                 # Test suite
├── out/                       # Compiled JavaScript (generated)
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
├── SECURITY.md               # Security policy
├── CODE_OF_CONDUCT.md        # Code of conduct
├── CONTRIBUTING.md           # Contribution guidelines
└── README.md                 # This file
```

### Building

Compile TypeScript:
```bash
npm run compile
```

Watch mode for development:
```bash
npm run watch
```

Package as VSIX:
```bash
npm run package
```

### Testing

Run linting:
```bash
npm run lint
```

Run tests:
```bash
npm test
```

### CI/CD

The project includes GitHub Actions workflows for:
- **Continuous Integration**: Runs on every push and PR
  - Linting
  - Building
  - Testing
  - Security audit
- **Release**: Triggered on version tags
  - Builds VSIX package
  - Creates GitHub release
  - Uploads artifact to GitHub Packages
  - Optionally publishes to VS Code Marketplace

## Troubleshooting

### "Webhook URL is not configured"

Make sure you've set `ragChat.webhookUrl` in your VS Code settings.

### "The requested webhook is not registered"

This error comes from your webhook server. Make sure:
1. The webhook is properly configured on the server
2. The URL in settings matches the server configuration
3. For test mode, you may need to trigger the webhook first

### SSL Certificate Errors

If you're using a self-signed certificate, you can disable SSL validation:

```json
{
  "ragChat.validateSSL": false
}
```

**Warning**: Only disable SSL validation in development/testing environments.

### File Not Found When Clicking Sources

Make sure:
1. You have a workspace folder open in VS Code
2. The file paths in the response are relative to your workspace root
3. The files exist in your workspace

## Security

For security concerns and responsible disclosure, please see [SECURITY.md](SECURITY.md).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Inspired by modern AI-powered development tools
