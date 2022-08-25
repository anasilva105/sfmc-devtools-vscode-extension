import { ExtensionContext} from 'vscode';
import { MultiStepInput } from './quickPickHelper';
import { window} from 'vscode';
import { execInTerminal } from './utils';
const commandExists = require('command-exists');
const git = require('simple-git')();

export async function initDevTools(context: ExtensionContext) {


	interface State {
		clientId: string;
		clientSecret: string;
		authUrl: string;
		accountId: string;
		credentialName: string;

		title: string;
		step: number;
		totalSteps: number;

	}

	async function collectInputs() {
			const state = {} as Partial<State>;
			await MultiStepInput.run(input => inputCredentialName(input, state));
			return state as State;
	}
	


	const title = 'Init DevTools';


	async function inputCredentialName(input: MultiStepInput, state: Partial<State>) {
		state.credentialName = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 1,
			totalSteps: 5,
			value: state.credentialName || '',

			prompt: 'how you would like the credential to be named (own choice)',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputClientId(input, state);
	}

	async function inputClientId(input: MultiStepInput, state: Partial<State>) {
		state.clientId = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 2,
			totalSteps: 5,
			value: state.clientId || '',
			prompt: 'Enter client id of installed package',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputClientSecret(input, state);
	}

	async function inputClientSecret(input: MultiStepInput, state: Partial<State>) {
		// TODO: Remember current value when navigating back.
		state.clientSecret = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 3,
			totalSteps: 5,
			value: state.clientSecret || '',
			prompt: 'Enter client secret of installed package',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputAuthUrl(input, state);
	}

	async function inputAuthUrl(input: MultiStepInput, state: Partial<State>) {
		// TODO: Remember current value when navigating back.
		state.authUrl = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 4,
			totalSteps: 5,
			value: state.authUrl || '',
			prompt: 'Enter tenant specific auth url of installed package',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputAccountId(input, state);
	}

	async function inputAccountId(input: MultiStepInput, state: Partial<State>) {
		// TODO: Remember current value when navigating back.
		state.accountId = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 5,
			totalSteps: 5,
			value: state.accountId || '',
			prompt: 'Enter MID of the Parent Business Unit',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		console.log(state);
		return validateInfo(state);
	
	}

	async function validateInfo(data: any){
		if (data.accountId  && data.credentialName && data.clientId && data.clientSecret && data.authUrl ){
		return runInitDevtools(data);	
		}else{
		window.showInformationMessage(`at least one field was empty, please try again`);
		return collectInputs();
		}
	}


	async function runInitDevtools(data: any): Promise<boolean>{
		data.clientId="zd7gf1xrn2rvhzvvjnig1rzg";
		data.clientSecret="qWzsVZRNKXpceoH62rdof7W2";
		data.authUrl="https://mct0l7nxfq2r988t1kxfy8sc47mq.auth.marketingcloudapis.com/";
		data.accountId="7281698";
		data.credentialName="new_test";
		//https://github.com/tulionatale
	
		const longexec="mcdev init --y.credentialName "+"'"+data.credentialName+"'"+" --y.client_id " +"'"+data.clientId+"'"+" --y.client_secret "+"'"+data.clientSecret+"'"+" --y.auth_url "+"'"+data.authUrl+"'"+" --y.account_id "+data.accountId;
		//const longexec2="mcdev init --y.credentialName "+'"'+data.credentialName+'"'+" --y.client_id " +'"'+data.clientId+'"'+" --y.client_secret "+'"'+data.clientSecret+'"'+" --y.auth_url "+'"'+data.authUrl+'"'+" --y.account_id "+data.accountId;

		console.log(longexec);
		let result: any = await execInTerminal(longexec);
		console.log('run');
		console.log(result);
		return result;
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

/*
  async function _getGitConfigUser() {
	const gitConfigs = await git.listConfig();
	// remove local config
	delete gitConfigs.values['.git/config'];
	const result = {};

	for (const file of Object.keys(gitConfigs.values)) {
		if (gitConfigs.values[file]['user.name']) {
			result['user.name'] = gitConfigs.values[file]['user.name'];
		}
		if (gitConfigs.values[file]['user.email']) {
			result['user.email'] = gitConfigs.values[file]['user.email'];
		}
	}
	if (!result['user.name'] || !result['user.email']) {
		return null;
	}
	return result;
};*/

	const state = await collectInputs();
}
