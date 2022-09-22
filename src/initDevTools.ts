import { ExtensionContext, window } from 'vscode';
import { MultiStepInput } from './quickPickHelper';
const commandExists = require('command-exists');

export async function initDevTools(context: ExtensionContext) {
  interface State {
    gitUsername: string;
    gitEmail: string;
    clientId: string;
    clientSecret: string;
    authUrl: string;
    gitRemoteUrl: string;
    accountId: string;
    credentialName: string;
    title: string;
    step: number;
  }

  async function collectInputs() {
    terminal.show();
    const state = {} as Partial<State>;
    await MultiStepInput.run((input) => inputGitUsername(input, state));
    return state as State;
  }

  const title = 'Init DevTools';
  const terminal = window.createTerminal(`Test`);

  async function requirements() {
    if (!commandExists.sync('git')) {
      window.showInformationMessage('Git installation not found.');
      window.showInformationMessage(
        'Please follow our tutorial on installing Git: https://github.com/Accenture/sfmc-devtools#212-install-the-git-command-line'
      );
    } else {
      await collectInputs();
    }
  }

  async function inputGitUsername(input: MultiStepInput, state: Partial<State>) {
    state.gitUsername = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 1,
      value: state.gitUsername || '',
      prompt: 'Enter Git Username',
      validate: validateUsename,
      shouldResume: shouldResume
    });

    return (input: MultiStepInput) => inputGitEmail(input, state);
  }
  async function inputGitEmail(input: MultiStepInput, state: Partial<State>) {
    state.gitEmail = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 2,
      value: state.gitEmail || '',
      prompt: 'Enter Git Email',
      validate: validateEmail,
      shouldResume: shouldResume
    });

    return (input: MultiStepInput) => inputCredentialName(input, state);
  }

  async function inputCredentialName(input: MultiStepInput, state: Partial<State>) {
    state.credentialName = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 3,
      value: state.credentialName || '',
      prompt: 'how you would like the credential to be named (own choice)',
      validate: validateInput,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputClientId(input, state);
  }

  async function inputClientId(input: MultiStepInput, state: Partial<State>) {
    state.clientId = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 4,
      value: state.clientId || '',
      prompt: 'Enter client id of installed package',
      validate: validateInput,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputClientSecret(input, state);
  }

  async function inputClientSecret(input: MultiStepInput, state: Partial<State>) {
    state.clientSecret = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 5,
      value: state.clientSecret || '',
      prompt: 'Choose a unique name for the Application Service',
      validate: validateInput,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputAuthUrl(input, state);
  }

  async function inputAuthUrl(input: MultiStepInput, state: Partial<State>) {
    state.authUrl = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 6,
      value: state.authUrl || '',
      prompt: 'Enter tenant specific auth url of installed package',
      validate: validateInput,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputAccountId(input, state);
  }

  async function inputAccountId(input: MultiStepInput, state: Partial<State>) {
    state.accountId = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 7,
      value: state.accountId || '',
      prompt: 'Enter MID of the Parent Business Unit',
      validate: validateMID,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => inputGitRemoteUrl(input, state);
  }

  async function inputGitRemoteUrl(input: MultiStepInput, state: Partial<State>) {
    state.gitRemoteUrl = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 8,
      value: state.gitRemoteUrl || '',
      prompt: 'Enter URL of Git remote server',
      validate: validateInput,
      shouldResume: shouldResume
    });
    validateInfo(state);
    return;
  }

  async function validateInfo(data: any) {
    if (
      data.accountId &&
      data.credentialName &&
      data.clientId &&
      data.clientSecret &&
      data.authUrl &&
      data.gitUsername &&
      data.gitEmail &&
      data.gitRemoteUrl
    ) {
      return runInitDevtools(data);
    } else {
      window.showInformationMessage(`at least one field was empty, please try again`);
      return collectInputs();
    }
  }

  async function runInitDevtools(data: any): Promise<boolean> {
    data.clientId = 'zd7gf1xrn2rvhzvvjnig1rzg';
    data.clientSecret = 'qWzsVZRNKXpceoH62rdof7W2';
    data.authUrl = "https://mct0l7nxfq2r988t1kxfy8sc47mq.auth.marketingcloudapis.com/";
    data.accountId = 7330930;
    data.credentialName = 'Testing_devtools-2';
    data.gitRemoteUrl = 'https://github.com/asilva102/sfmc_devtools_extension_test.git';
    const longexec = `mcdev init --y.credentialName "${data.credentialName}" --y.client_id "${data.clientId}" --y.client_secret "${data.clientSecret}" --y.auth_url "${data.authUrl}" --y.gitRemoteUrl "${data.gitRemoteUrl}" --y.account_id ${data.accountId}`;
    console.log(longexec);
    terminal.sendText(longexec);
    return;
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>((resolve, reject) => {
      // noop
    });
  }

  async function validateEmail(value: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    value = value.trim();
    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !value || !regex.test(String(value).toLowerCase())
      ? 'Please enter valid email'
      : undefined;
  }
  async function validateUsename(value: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    value = value.trim();
    return !value || value.trim().length < 4 || value.includes('"') || value.includes("'")
      ? 'Please enter valid username'
      : undefined;
  }

  async function validateMID(value: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const num = Number(value);
    return Number.isInteger(num)
      ? undefined
      : 'Please enter valid MID Number';
  }

  async function validateInput(value: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    value = value.trim();
    return !value ? 'Please enter the indicated information' : undefined;
  }

  requirements();
}
