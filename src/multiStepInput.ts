/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { QuickPickItem, window, Disposable, QuickInputButton, QuickInput, ExtensionContext, QuickInputButtons } from 'vscode';

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function multiStepInput(context: ExtensionContext) {




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

	async function startInit() {
			const state = {} as Partial<State>;
			await MultiStepInput.run(input => inputCredentialName(input, state));
			return state as State;
		}
	


	const title = 'Init DevTools';




	async function inputCredentialName(input: MultiStepInput, state: Partial<State>) {
		// TODO: Remember current value when navigating back.
		state.credentialName = await input.showInputBox({
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
			title,
			step: 3,
			totalSteps: 5,
			value: state.clientSecret || '',
			prompt: 'Choose a unique name for the Application Service',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		return (input: MultiStepInput) => inputAuthUrl(input, state);
	}

	async function inputAuthUrl(input: MultiStepInput, state: Partial<State>) {
		// TODO: Remember current value when navigating back.
		state.authUrl = await input.showInputBox({
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
			title,
			step: 5,
			totalSteps: 5,
			value: state.accountId || '',
			prompt: 'Enter MID of the Parent Business Unit',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
		});
		console.log(state);
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


	const state = await startInit();
	window.showInformationMessage(`Creating Application Service '${state.credentialName}'`);
}


// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------


class InputFlowAction {
	static back = new InputFlowAction();
	static cancel = new InputFlowAction();
	static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends QuickPickItem> {
	title: string;
	step: number;
	totalSteps: number;
	items: T[];
	activeItem?: T;
	placeholder: string;
	buttons?: QuickInputButton[];
	shouldResume: () => Thenable<boolean>;
}

interface InputBoxParameters {
	title: string;
	step: number;
	totalSteps: number;
	value: string;
	prompt: string;
	validate: (value: string) => Promise<string | undefined>;
	buttons?: QuickInputButton[];
	shouldResume: () => Thenable<boolean>;
}

class MultiStepInput {

	static async run<T>(start: InputStep) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	private current?: QuickInput;
	private steps: InputStep[] = [];

	private async stepThrough<T>(start: InputStep) {
		let step: InputStep | void = start;
		while (step) {
			this.steps.push(step);
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try {
				step = await step(this);
			} catch (err) {
				if (err === InputFlowAction.back) {
					this.steps.pop();
					step = this.steps.pop();
				} else if (err === InputFlowAction.resume) {
					step = this.steps.pop();
				} else if (err === InputFlowAction.cancel) {
					step = undefined;
				} else {
					throw err;
				}
			}
		}
		if (this.current) {
			this.current.dispose();
		}
	}

	async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, placeholder, buttons, shouldResume }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<T | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				const input = window.createQuickPick<T>();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.placeholder = placeholder;
				input.items = items;
				if (activeItem) {
					input.activeItems = [activeItem];
				}
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}

	async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, prompt, validate, buttons, shouldResume }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<string | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
				const input = window.createInputBox();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.value = value || '';
				input.prompt = prompt;
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				let validating = validate('');
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(<any>item);
						}
					}),
					input.onDidAccept(async () => {
						const value = input.value;
						input.enabled = false;
						input.busy = true;
						if (!(await validate(value))) {
							resolve(value);
						}
						input.enabled = true;
						input.busy = false;
					}),
					input.onDidChangeValue(async text => {
						const current = validate(text);
						validating = current;
						const validationMessage = await current;
						if (current === validating) {
							input.validationMessage = validationMessage;
						}
					}),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}
}
