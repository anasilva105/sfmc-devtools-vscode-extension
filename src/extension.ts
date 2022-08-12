import { commands, ExtensionContext } from 'vscode';
import { installHelper } from './installHelper';
import { initHelper } from './initHelper';

export function activate(context: ExtensionContext) {
	
	let disposable = commands.registerCommand('sfmc-devtools-vscode.mcdev', () => {
		installHelper(context);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
