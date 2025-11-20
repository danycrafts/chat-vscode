import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('undefined_publisher.rag-chat'));
    });

    test('Should register rag-chat.openChat command', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('rag-chat.openChat'));
    });

    test('Configuration should have default values', () => {
        const config = vscode.workspace.getConfiguration('ragChat');

        assert.strictEqual(typeof config.get('webhookUrl'), 'string');
        assert.strictEqual(typeof config.get('collection'), 'string');
        assert.strictEqual(typeof config.get('timeout'), 'number');
        assert.strictEqual(typeof config.get('validateSSL'), 'boolean');
        assert.strictEqual(typeof config.get('includeContext'), 'boolean');
    });
});
