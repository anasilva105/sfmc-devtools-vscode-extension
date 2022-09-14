import {
	window,
	commands,
	ExtensionContext,
	StatusBarItem,
	StatusBarAlignment,
  } from "vscode";
  import { initDevTools } from "./initDevTools";
  import { operationalCommands } from "./operationalCommands";
  import { installHelper } from "./installHelper";
  import { support } from "./support";
  
  export function activate(context: ExtensionContext) {
	const myCommandId = "sfmc-devtools-vscode.mcdev";
	context.subscriptions.push(
	  commands.registerCommand(myCommandId, async () => {
		const options: {
		  [key: string]: (context: ExtensionContext) => Promise<void>,
		} = {
		  initDevTools,
		  operationalCommands,
		  installHelper,
		  support,
		};
  
		const quickPick = window.createQuickPick();
		quickPick.items = Object.keys(options).map((label) => ({ label }));
		quickPick.onDidChangeSelection((selection) => {
		  if (selection[0]) {
			options[selection[0].label](context).catch(console.error);
		  }
		});
  
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	  })
	);
	const myStatusBarItem = window.createStatusBarItem(
	  StatusBarAlignment.Right,
	  100
	);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);
  
	myStatusBarItem.text = "sfmc-extension";
	myStatusBarItem.tooltip = "sfmc-extension for DevTools";
	myStatusBarItem.show();
  }
  
  /*	let disposable = commands.registerCommand('sfmc-devtools-vscode.mcdev', () => {
		  installHelper(context);
	  });
  
	  context.subscriptions.push(disposable);
  */
  
  // this method is called when your extension is deactivated
  export function deactivate() {}
  