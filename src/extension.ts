import * as vscode from 'vscode';
import { RagChatViewProvider } from './chatViewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('RAG Chat extension is now active');

    // Register the webview provider
    const provider = new RagChatViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'rag-chat.chatView',
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    // Register command to open chat
    const openChatCommand = vscode.commands.registerCommand('rag-chat.openChat', () => {
        vscode.commands.executeCommand('workbench.view.extension.rag-chat-sidebar');
    });

    context.subscriptions.push(openChatCommand);
}

export function deactivate() {}
