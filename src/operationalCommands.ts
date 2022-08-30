import { ExtensionContext, QuickPickItem} from 'vscode';
import { MultiStepInput } from './quickPickHelper';
import { window} from 'vscode';
import { execInTerminal } from './utils';


export async function operationalCommands(context: ExtensionContext) {


	interface State {
		credentialName: string;
		businessUnit: string;
		type:string;
		name:string;
		key:string;
		market:string;
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
		const options: QuickPickItem[] = ['retrieve', 'deploy','badKeys', 'delete','document','retrieveAsTemplate', 'buildTemplate', 'buildDefinition']
		.map(label => ({ label }));
		 await input.showQuickPick({
			ignoreFocusOut: true,
			title,
			step: 1,
			totalSteps: 3,
			placeholder: 'Pick an operational command',
			items: options,
			activeItem: typeof state.operattionalCommand !== 'string' ? state.operattionalCommand : undefined,
			shouldResume: shouldResume
		});
		
		return (input: MultiStepInput) => inputCredentialName(input, state);
		
	}
	

	async function inputCredentialName(input: MultiStepInput, state: Partial<State>) {
		state.credentialName = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 3,
			totalSteps: 8,
			value: state.credentialName || '',
			prompt: 'Enter the credential name',
			validate: validateInput,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputBU(input, state);
	}
	

	async function inputBU(input: MultiStepInput, state: Partial<State>) {
		state.businessUnit = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 3,
			totalSteps: 8,
			value: state.businessUnit || '',
			prompt: 'how you would like the credential to be named (own choice)',
			validate: validateInput,
			shouldResume: shouldResume
		});
       switch(state.operattionalCommand.label){
		case 'retrieve':
		case 'deploy':
		case 'document':
		case 'delete':	
		case 'retrieveAsTemplate':
		case 'buildTemplate':
		case 'buildDefinition':	
		return (input: MultiStepInput) => inputType(input, state);
		break;
		default: 
		console.log('mcdev '+state.operattionalCommand.label+' '+state.credentialName+'/'+state.businessUnit);
	//	let result: any = await execInTerminal('mcdev '+state.operattionalCommand.label+' '+state.credentialName+'/'+state.businessUnit);
	//	return result;
		break;

	   }



		return (input: MultiStepInput) => inputType(input, state);
	}

	async function inputType(input: MultiStepInput, state: Partial<State>) {
		state.type = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 3,
			totalSteps: 8,
			value: state.type || '',
			prompt: 'how you would like the credential to be named (own choice)',
			validate: validateInput,
			shouldResume: shouldResume
		});
		const command=state.operattionalCommand.label;
		if (command==='retrieve' || command==='deploy' || command==='delete' ||	command==='buildTemplate' ){
		return (input: MultiStepInput) => inputKey(input, state);
    	}else{
		//S
	    }


		return (input: MultiStepInput) => inputKey (input, state);
	}

	async function inputKey(input: MultiStepInput, state: Partial<State>) {
		state.key = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 3,
			totalSteps: 8,
			value: state.key || '',
			prompt: 'how you would like the credential to be named (own choice)',
			validate: validateInput,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputMarket(input, state);
	}

	async function inputMarket(input: MultiStepInput, state: Partial<State>) {
		state.market = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 3,
			totalSteps: 8,
			value: state.market || '',
			prompt: 'how you would like the credential to be named (own choice)',
			validate: validateInput,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputName(input, state);
	}

	async function inputName(input: MultiStepInput, state: Partial<State>) {
		state.name = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 3,
			totalSteps: 8,
			value: state.name || '',
			prompt: 'how you would like the credential to be named (own choice)',
			validate: validateInput,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputMarket(input, state);
	}


	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

	async function validateInput (value: string) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		value = value.trim();
		return (!value) ? 'Please enter the indicated information': undefined ;
		}

	await collectInputs();
}
