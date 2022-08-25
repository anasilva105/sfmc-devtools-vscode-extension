import { ExtensionContext, QuickPickItem} from 'vscode';
import { MultiStepInput } from './quickPickHelper';
import { window} from 'vscode';
import { execInTerminal } from './utils';


export async function operationalCommands(context: ExtensionContext) {


	interface State {
		name: string;
		operattionalCommand: QuickPickItem;
		title: string;
		step: number;
		totalSteps: number;

	}

	//collects the inputs and calls the first window
	async function collectInputs() {
			const state = {} as Partial<State>;
			await MultiStepInput.run(input => pickOperationalCommand(input, state));
			return state as State;
	}
	


	const title = 'Init DevTools';


	async function pickOperationalCommand(input: MultiStepInput, state: Partial<State>) {
		const options: QuickPickItem[] = ['retrieve', 'deploy', 'delete','retrieveAsTemplate', 'buildTemplate', 'buildDefinition', 'buildDefinitionBulk', 'createDeltaPkg']
		.map(label => ({ label }));
		const pick = await input.showQuickPick({
			ignoreFocusOut: true,
			title,
			step: 1,
			totalSteps: 3,
			placeholder: 'Pick an operational command',
			items: options,
			activeItem: typeof state.operattionalCommand !== 'string' ? state.operattionalCommand : undefined,
			shouldResume: shouldResume
		});
		state.operattionalCommand = pick;
		
		
		switch (pick.label){
			case 'retrieve': 
			case 'deploy': 
			case 'delete': 
			case 'retrieveAsTemplate': 
			case 'buildTemplate': 
			case 'buildDefinition': 
			case 'buildDefinitionBulk': 
			case 'createDeltaPkg': 
			return	 console.log(pick.label);
			break;
			default:
				console.log('problem');
				break;
		}
		
	}


	async function name(input: MultiStepInput, state: Partial<State>) {
		state.name = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 2,
			totalSteps: 3,
			value: state.name || '',
			prompt: 'Enter MID of the Parent Business Unit',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		console.log(state);
		return true;
	
	}


	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

	async function validateNameIsUnique(name: string) {
		// ...validate...
		await new Promise(resolve => setTimeout(resolve, 1000));
		return name === 'vscode' ? 'Name not unique' : undefined;
	}

	const state = await collectInputs();
}
