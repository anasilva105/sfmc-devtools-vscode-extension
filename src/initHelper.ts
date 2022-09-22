import { ExtensionContext, window } from 'vscode';
import { MultiStepInput } from './quickPickHelper';

export async function initDevTools(context: ExtensionContext) {
  interface State {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    accountId: string;
    credentialName: string;
    title: string;
    step: number;
  }

  async function collectInputs() {
    const state = {} as Partial<State>;
    await MultiStepInput.run((input) => inputCredentialName(input, state));
    return state as State;
  }

  const title = 'Init DevTools';

  async function inputCredentialName(input: MultiStepInput, state: Partial<State>) {
    state.credentialName = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 1,
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
      value: state.accountId || '',
      prompt: 'Enter MID of the Parent Business Unit',
      validate: validateNameIsUnique,
      shouldResume: shouldResume
    });
    console.log(state);
    return validateInfo(state);
  }

  async function validateInfo(data: any) {
    if (
      data.accountId &&
      data.credentialName &&
      data.clientId &&
      data.clientSecret &&
      data.authUrl
    ) {
      return runInitDevtools(data);
    } else {
      window.showInformationMessage(`at least one field was empty, please try again`);
      return collectInputs();
    }
  }

  async function runInitDevtools(data: any): Promise<boolean> {
    const longexec = `mcdev init --y.credentialName "${data.credentialName}" --y.client_id "${data.clientId}" --y.client_secret "${data.clientSecret}" --y.auth_url "${data.clientSecret}" --y.account_id ${data.accountId}`;
    const terminal = window.createTerminal(`Help`);
    terminal.show();
    terminal.sendText(longexec);
    return;
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>((resolve, reject) => {
      // noop
    });
  }

  async function validateNameIsUnique(name: string) {
    // ...validate...
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return name === 'vscode' ? 'Name not unique' : undefined;
  }

  const state = await collectInputs();
}
