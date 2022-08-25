/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ExtensionContext, window} from 'vscode';
import { MultiStepInput } from './quickPickHelper';
import { execInTerminal } from './utils';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function initDevTools(context: ExtensionContext) {



	interface State {
		gitUsername:string;
		gitEmail:string;
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
			await MultiStepInput.run(input => inputGitUsername(input, state));
			return state as State;
		}
	


	const title = 'Init DevTools';


	async function inputGitUsername(input: MultiStepInput, state: Partial<State>) {
		state.gitUsername = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 1,
			totalSteps: 7,
			value: state.gitUsername || '',
			prompt: 'how you would like the credential to be named (own choice)',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputGitEmail(input, state);
	}
	async function inputGitEmail(input: MultiStepInput, state: Partial<State>) {
		state.gitEmail = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 2,
			totalSteps: 7,
			value: state.gitEmail || '',
			prompt: 'how you would like the credential to be named (own choice)',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputCredentialName(input, state);
	}


	async function inputCredentialName(input: MultiStepInput, state: Partial<State>) {
		state.credentialName = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 3,
			totalSteps: 7,
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
			step: 4,
			totalSteps: 7,
			value: state.clientId || '',
			prompt: 'Enter client id of installed package',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputClientSecret(input, state);
	}

	async function inputClientSecret(input: MultiStepInput, state: Partial<State>) {
		state.clientSecret = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 5,
			totalSteps: 7,
			value: state.clientSecret || '',
			prompt: 'Choose a unique name for the Application Service',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputAuthUrl(input, state);
	}

	async function inputAuthUrl(input: MultiStepInput, state: Partial<State>) {
		state.authUrl = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 6,
			totalSteps: 7,
			value: state.authUrl || '',
			prompt: 'Enter tenant specific auth url of installed package',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputAccountId(input, state);
	}

	async function inputAccountId(input: MultiStepInput, state: Partial<State>) {
		state.accountId = await input.showInputBox({
			ignoreFocusOut: true,
			title,
			step: 7,
			totalSteps: 7,
			value: state.accountId || '',
			prompt: 'Enter MID of the Parent Business Unit',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		validateInfo(state);
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


	const state = await collectInputs();
	window.showInformationMessage(`Creating Application Service '${state.credentialName}'`);
}

