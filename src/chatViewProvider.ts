import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

interface RagResponse {
    answer: string;
    sources?: Array<{
        file: string;
        language: string;
        lines: string;
        score: number;
    }>;
    sources_count?: number;
    code?: number;
    message?: string;
    hint?: string;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'error';
    content: string;
    sources?: RagResponse['sources'];
}

export class RagChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _chatHistory: ChatMessage[] = [];

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this.handleSendMessage(data.message);
                    break;
                case 'openFile':
                    await this.handleOpenFile(data.file, data.lines);
                    break;
            }
        });

        // Send initial chat history if any
        if (this._chatHistory.length > 0) {
            this._view?.webview.postMessage({
                type: 'loadHistory',
                messages: this._chatHistory
            });
        }
    }

    private async handleSendMessage(message: string) {
        if (!message.trim()) {
            return;
        }

        // Add user message to history
        const userMessage: ChatMessage = { role: 'user', content: message };
        this._chatHistory.push(userMessage);

        // Send user message to webview
        this._view?.webview.postMessage({
            type: 'addMessage',
            message: userMessage
        });

        // Show loading indicator
        this._view?.webview.postMessage({ type: 'showLoading' });

        try {
            const config = vscode.workspace.getConfiguration('ragChat');
            const webhookUrl = config.get<string>('webhookUrl', '');
            const collection = config.get<string>('collection', '');
            const timeout = config.get<number>('timeout', 30000);
            const validateSSL = config.get<boolean>('validateSSL', true);

            if (!webhookUrl) {
                throw new Error('Webhook URL is not configured. Please set ragChat.webhookUrl in settings.');
            }

            if (!collection) {
                throw new Error('Collection name is not configured. Please set ragChat.collection in settings.');
            }

            const response = await this.queryRag(webhookUrl, message, collection, timeout, validateSSL);

            // Handle error responses
            if (response.code && response.code !== 200) {
                throw new Error(`${response.message || 'Unknown error'}${response.hint ? '\n\n' + response.hint : ''}`);
            }

            // Add assistant response to history
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.answer || 'No answer received',
                sources: response.sources
            };
            this._chatHistory.push(assistantMessage);

            // Send assistant message to webview
            this._view?.webview.postMessage({
                type: 'addMessage',
                message: assistantMessage
            });

        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'error',
                content: `Error: ${error instanceof Error ? error.message : String(error)}`
            };
            this._chatHistory.push(errorMessage);

            this._view?.webview.postMessage({
                type: 'addMessage',
                message: errorMessage
            });
        } finally {
            this._view?.webview.postMessage({ type: 'hideLoading' });
        }
    }

    private async handleOpenFile(filePath: string, lines: string) {
        try {
            // Get workspace folders
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('No workspace folder is open');
                return;
            }

            // Try to find the file in workspace
            const workspaceRoot = workspaceFolders[0].uri;
            const fileUri = vscode.Uri.joinPath(workspaceRoot, filePath);

            // Parse line range (e.g., "27-35" or "49-50")
            const [startLine, endLine] = lines.split('-').map(l => parseInt(l.trim(), 10) - 1);

            // Open the document
            const document = await vscode.workspace.openTextDocument(fileUri);
            const editor = await vscode.window.showTextDocument(document);

            // Select the specified lines
            if (!isNaN(startLine)) {
                const start = new vscode.Position(startLine, 0);
                const end = new vscode.Position(isNaN(endLine) ? startLine : endLine, 999);
                editor.selection = new vscode.Selection(start, end);
                editor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter);
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private queryRag(
        webhookUrl: string,
        query: string,
        collection: string,
        timeout: number,
        validateSSL: boolean
    ): Promise<RagResponse> {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(webhookUrl);
            const postData = JSON.stringify({ query, collection });

            const options: https.RequestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                rejectUnauthorized: validateSSL
            };

            const protocol = parsedUrl.protocol === 'https:' ? https : http;

            const req = protocol.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response: RagResponse = JSON.parse(data);
                        resolve(response);
                    } catch (error) {
                        reject(new Error(`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request failed: ${error.message}`));
            });

            req.setTimeout(timeout, () => {
                req.destroy();
                reject(new Error(`Request timeout after ${timeout}ms`));
            });

            req.write(postData);
            req.end();
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RAG Chat</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        #chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .message {
            padding: 10px;
            border-radius: 5px;
            max-width: 90%;
            word-wrap: break-word;
        }

        .message.user {
            align-self: flex-end;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .message.assistant {
            align-self: flex-start;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
        }

        .message.error {
            align-self: flex-start;
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            color: var(--vscode-errorForeground);
        }

        .message-content {
            white-space: pre-wrap;
            line-height: 1.5;
        }

        .sources {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid var(--vscode-panel-border);
        }

        .sources-title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9em;
        }

        .source-item {
            padding: 5px;
            margin: 3px 0;
            background-color: var(--vscode-editor-background);
            border-left: 3px solid var(--vscode-button-background);
            cursor: pointer;
            font-size: 0.85em;
        }

        .source-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }

        .source-file {
            font-family: var(--vscode-editor-font-family);
            color: var(--vscode-textLink-foreground);
        }

        .source-lines {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }

        #input-container {
            padding: 10px;
            border-top: 1px solid var(--vscode-panel-border);
            display: flex;
            gap: 5px;
        }

        #message-input {
            flex: 1;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            outline: none;
        }

        #message-input:focus {
            border-color: var(--vscode-focusBorder);
        }

        #send-button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }

        #send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        #send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .loading {
            display: none;
            padding: 10px;
            text-align: center;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }

        .loading.visible {
            display: block;
        }

        .markdown {
            line-height: 1.6;
        }

        .markdown h1, .markdown h2, .markdown h3 {
            margin-top: 1em;
            margin-bottom: 0.5em;
        }

        .markdown p {
            margin-bottom: 0.5em;
        }

        .markdown code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }

        .markdown pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
            margin: 0.5em 0;
        }

        .markdown pre code {
            background: none;
            padding: 0;
        }

        .markdown ul, .markdown ol {
            margin-left: 1.5em;
            margin-bottom: 0.5em;
        }

        .markdown table {
            border-collapse: collapse;
            margin: 0.5em 0;
            width: 100%;
        }

        .markdown th, .markdown td {
            border: 1px solid var(--vscode-panel-border);
            padding: 6px;
            text-align: left;
        }

        .markdown th {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div id="chat-container"></div>
    <div class="loading" id="loading">Thinking...</div>
    <div id="input-container">
        <input type="text" id="message-input" placeholder="Ask a question about your code..." />
        <button id="send-button">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const loadingIndicator = document.getElementById('loading');

        // Simple markdown-like formatting
        function formatMarkdown(text) {
            // Convert markdown to HTML (basic implementation)
            let html = text;

            // Code blocks
            html = html.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');

            // Inline code
            html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');

            // Bold
            html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');

            // Headers
            html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

            return html;
        }

        function addMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${message.role}\`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content markdown';
            contentDiv.innerHTML = formatMarkdown(message.content);
            messageDiv.appendChild(contentDiv);

            if (message.sources && message.sources.length > 0) {
                const sourcesDiv = document.createElement('div');
                sourcesDiv.className = 'sources';

                const title = document.createElement('div');
                title.className = 'sources-title';
                title.textContent = \`Sources (\${message.sources.length}):\`;
                sourcesDiv.appendChild(title);

                message.sources.forEach(source => {
                    const sourceItem = document.createElement('div');
                    sourceItem.className = 'source-item';

                    const fileSpan = document.createElement('div');
                    fileSpan.className = 'source-file';
                    fileSpan.textContent = source.file;

                    const linesSpan = document.createElement('div');
                    linesSpan.className = 'source-lines';
                    linesSpan.textContent = \`Lines: \${source.lines} | Score: \${source.score.toFixed(3)}\`;

                    sourceItem.appendChild(fileSpan);
                    sourceItem.appendChild(linesSpan);

                    sourceItem.addEventListener('click', () => {
                        vscode.postMessage({
                            type: 'openFile',
                            file: source.file,
                            lines: source.lines
                        });
                    });

                    sourcesDiv.appendChild(sourceItem);
                });

                messageDiv.appendChild(sourcesDiv);
            }

            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (message) {
                vscode.postMessage({
                    type: 'sendMessage',
                    message: message
                });
                messageInput.value = '';
            }
        }

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
                case 'addMessage':
                    addMessage(message.message);
                    break;
                case 'showLoading':
                    loadingIndicator.classList.add('visible');
                    sendButton.disabled = true;
                    messageInput.disabled = true;
                    break;
                case 'hideLoading':
                    loadingIndicator.classList.remove('visible');
                    sendButton.disabled = false;
                    messageInput.disabled = false;
                    messageInput.focus();
                    break;
                case 'loadHistory':
                    message.messages.forEach(msg => addMessage(msg));
                    break;
            }
        });

        // Focus input on load
        messageInput.focus();
    </script>
</body>
</html>`;
    }
}
