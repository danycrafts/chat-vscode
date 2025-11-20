# RAG Chat for VS Code

A Visual Studio Code extension that provides a chat interface for querying RAG (Retrieval-Augmented Generation) enabled code repositories.

## Features

- **Chat Interface**: Interactive sidebar chat interface for asking questions about your code
- **Source References**: Clickable source file references with line numbers
- **Configurable Endpoint**: Easy configuration of webhook URL and collection name
- **Syntax Highlighting**: Markdown formatted responses with code highlighting
- **Context Retention**: Chat history is preserved while the view is open

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
| `ragChat.webhookUrl` | The webhook URL endpoint for RAG queries | `https://dam-poc.kipitz.xyz/webhook-test/rag-chat` |
| `ragChat.collection` | The collection name to query | `jenkins-git-repo` |
| `ragChat.timeout` | Request timeout in milliseconds | `30000` |
| `ragChat.validateSSL` | Validate SSL certificates for HTTPS requests | `true` |

### Example settings.json

```json
{
  "ragChat.webhookUrl": "https://your-server.com/webhook/rag-chat",
  "ragChat.collection": "your-collection-name",
  "ragChat.timeout": 30000,
  "ragChat.validateSSL": true
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
2. Click on any source file reference
3. The file will open automatically at the specified line range
4. The relevant lines will be highlighted

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
  "collection": "collection-name"
}
```

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
├── src/
│   ├── extension.ts          # Extension entry point
│   └── chatViewProvider.ts   # Chat webview provider
├── out/                       # Compiled JavaScript (generated)
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
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

### Testing

Run linting:
```bash
npm run lint
```

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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
