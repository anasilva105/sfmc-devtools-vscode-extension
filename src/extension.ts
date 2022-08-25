import { window, commands, ExtensionContext } from 'vscode';
import { installHelper } from './installHelper';
import { initDevTools } from './initDevTools';
//import { operationalCommands } from './operationalCommands';

export function activate(context: ExtensionContext) {
	

	context.subscriptions.push(commands.registerCommand('sfmc-devtools-vscode.mcdev', async () => {
		const options: { [key: string]: (context: ExtensionContext) => Promise<void> } = {
			initDevTools//, operationalCommands,
		};
		const quickPick = window.createQuickPick();
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				options[selection[0].label](context)
					.catch(console.error);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));
}
/*	let disposable = commands.registerCommand('sfmc-devtools-vscode.mcdev', () => {
		installHelper(context);
	});

	context.subscriptions.push(disposable);
*/

// this method is called when your extension is deactivated
export function deactivate() {}
