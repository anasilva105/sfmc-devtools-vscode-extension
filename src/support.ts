import {   ExtensionContext,     QuickPickItem,     window, env, Uri} from 'vscode';
import {     MultiStepInput } from './quickPickHelper';



export async function support(context: ExtensionContext) {


    interface State {
        helpCommand: QuickPickItem;
        title: string;
        step: number;
        totalSteps: number;

    }

    async function collectInputs() {
        const state = {}  as Partial < State > ;
        await MultiStepInput.run(input => pickHelpCommand(input, state));
        return state as State;
    }



    const title = 'DevTools Help';


    async function pickHelpCommand(
        input: MultiStepInput,
        state: Partial < State >
    ) {
        const options: QuickPickItem[] = [
            "check version mcdev",
            "open extension documentation",
            "open mcdev documentation",
        ].map((label) => ({
            label
        }));
        state.helpCommand = await input.showQuickPick({
            ignoreFocusOut: true,
            title,
            step: 1,
            totalSteps: 3,
            placeholder: "Pick an operational command",
            items: options,
            activeItem: typeof state.helpCommand !== "string" ?
                state.helpCommand :
                undefined,
           shouldResume: shouldResume,
        });
        const terminal = window.createTerminal(`Help`);
		terminal.show();
        switch (state.helpCommand.label) {
            case "upgrade mcdev":
                terminal.sendText(`mcdev upgrade --y.credentialsName --y.credentialsName`);
                break;
            case "check version mcdev":
                terminal.sendText('mcdev --version');
                break;
            case "open extension documentation":
				env.openExternal(Uri.parse("https://github.com/asilva102/sfmc-devtools-vscode-extension"));  
                break;
            case "open mcdev documentation":
				env.openExternal(Uri.parse("https://github.com/Accenture/sfmc-devtools/"));  
                break;
        }
        return;
	}

    function shouldResume() {
        return new Promise < boolean > ((resolve, reject) => {
        });
    }


    const state = await collectInputs();
}