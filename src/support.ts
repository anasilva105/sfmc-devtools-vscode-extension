import { ExtensionContext, QuickPickItem, window, env, Uri } from 'vscode';
import { MultiStepInput } from './quickPickHelper';

export async function support(context: ExtensionContext) {
  interface State {
    helpCommand: QuickPickItem;
    gitUsername: string;
    gitEmail: string;
    title: string;
    step: number;
  }

  async function collectInputs() {
    const state = {} as Partial<State>;
    await MultiStepInput.run((input) => pickHelpCommand(input, state));
    return state as State;
  }

  const title = 'DevTools Help';
  const terminal = window.createTerminal(`Help`);

  async function pickHelpCommand(input: MultiStepInput, state: Partial<State>) {
    const options: QuickPickItem[] = [
      'upgrade mcdev',
      'check version mcdev',
      'open extension documentation',
      'open mcdev documentation'
    ].map((label) => ({
      label
    }));
    state.helpCommand = await input.showQuickPick({
      ignoreFocusOut: true,
      title,
      step: 1,
      placeholder: 'Pick an operational command',
      items: options,
      activeItem: typeof state.helpCommand !== 'string' ? state.helpCommand : undefined,
      shouldResume: shouldResume
    });
    terminal.show();
    switch (state.helpCommand.label) {
      case 'upgrade mcdev':
        return (input: MultiStepInput) => inputGitUsername(input, state);
        break;
      case 'check version mcdev':
        terminal.sendText('mcdev --version');
        break;
      case 'open extension documentation':
        env.openExternal(
          Uri.parse('https://github.com/asilva102/sfmc-devtools-vscode-extension')
        );
        break;
      case 'open mcdev documentation':
        env.openExternal(Uri.parse('https://github.com/Accenture/sfmc-devtools/'));
        break;
    }
    return;
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

    return terminal.sendText(
      `mcdev upgrade --y.user.name "${state.gitUsername}" --y.user.email "${state.gitEmail}"`
    );
  }

  function shouldResume() {
    return new Promise<boolean>((resolve, reject) => {});
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

  const state = await collectInputs();
}
