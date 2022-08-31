import { ExtensionContext, QuickPickItem } from "vscode";
import { MultiStepInput } from "./quickPickHelper";
import { window } from "vscode";

export async function operationalCommands(context: ExtensionContext) {
  interface State {
    credentialName: string;
    businessUnit: string;
    type: string;
    name: string;
    key: string;
    market: string;
    operattionalCommand: QuickPickItem;
    title: string;
    step: number;
    totalSteps: number;
  }
  const terminal = window.createTerminal(`Test`);

  //collects the inputs and calls the first window
  async function collectInputs() {
    terminal.show();
    const state = {} as Partial<State>;
    await MultiStepInput.run((input) => pickOperationalCommand(input, state));
    return state as State;
  }

  var result: any;
  const title = "Operational Commands DevTools";

  async function pickOperationalCommand(
    input: MultiStepInput,
    state: Partial<State>
  ) {
    const options: QuickPickItem[] = [
      "retrieve",
      "deploy",
      "badKeys",
      "delete",
      "document",
      "retrieveAsTemplate",
      "buildTemplate",
      "buildDefinition",
      "reloadBUs",
    ].map((label) => ({ label }));
    state.operattionalCommand = await input.showQuickPick({
      ignoreFocusOut: true,
      title,
      step: 1,
      totalSteps: 3,
      placeholder: "Pick an operational command",
      items: options,
      activeItem:
        typeof state.operattionalCommand !== "string"
          ? state.operattionalCommand
          : undefined,
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => inputCredentialName(input, state);
  }

  async function inputCredentialName(
    input: MultiStepInput,
    state: Partial<State>
  ) {
    state.credentialName = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 3,
      totalSteps: 8,
      value: state.credentialName || "",
      prompt: "Enter the credential name",
      validate: validateInput,
      shouldResume: shouldResume,
    });
    switch (state.operattionalCommand.label) {
      case "reloadBUs":
        const command = `mcdev ${state.operattionalCommand.label} ${state.credentialName}`;
        console.log(command);
        terminal.show(true);
        terminal.sendText(command);
        return result;
        break;
      default:
        return (input: MultiStepInput) => inputBU(input, state);
        break;
    }
  }

  async function inputBU(input: MultiStepInput, state: Partial<State>) {
    state.businessUnit = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 3,
      totalSteps: 8,
      value: state.businessUnit || "",
      prompt: "Enter the Businness unit (use * to select all BU)",
      validate: validateInput,
      shouldResume: shouldResume,
    });
    if (
      state.operattionalCommand.label === "retrieve" &&
      state.businessUnit === "*"
    ) {
      const command = `mcdev ${state.operattionalCommand.label} ${state.credentialName}/${state.businessUnit}`;
      return terminal.sendText(command.trim());
    }
	console.log(state.businessUnit);
    switch (state.operattionalCommand.label) {
      case "badKeys":
      case "deploy":
        const command = `mcdev ${state.operattionalCommand.label} ${state.credentialName}/${state.businessUnit}`;
        return terminal.sendText(command.trim());
        break;
      case "retrieve":
      case "delete":
      case "retrieveAsTemplate":
      case "buildTemplate":
      case "buildDefinition":
      case "document":
        return (input: MultiStepInput) => inputType(input, state);
        break;
    }
  }

  async function inputType(input: MultiStepInput, state: Partial<State>) {
    state.type = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 3,
      totalSteps: 8,
      value: state.type || "",
      prompt: "Enter Type",
      validate: validateInput,
      shouldResume: shouldResume,
    });
    switch (state.operattionalCommand.label) {
      case "document":
        const command = `mcdev ${state.operattionalCommand.label} ${state.credentialName}/${state.businessUnit} ${state.type}`;
        console.log(command.trim());
        terminal.sendText(command.trim());
        return result;
        break;
      default:
        return (input: MultiStepInput) => inputKey(input, state);
        break;
    }
  }

  async function inputKey(input: MultiStepInput, state: Partial<State>) {
    state.key = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 3,
      totalSteps: 8,
      value: state.key || "",
      prompt: "Enter key",
      validate: validateInput,
      shouldResume: shouldResume,
    });

    switch (state.operattionalCommand.label) {
      case "delete":
      case "retrieve":
        const command = `mcdev ${state.operattionalCommand.label} ${state.credentialName}/${state.businessUnit} ${state.type} ${state.key}`;
        return terminal.sendText(command.trim());
        break;
      case "buildTemplate":
        return (input: MultiStepInput) => inputMarket(input, state);
        break;
      default:
        return (input: MultiStepInput) => inputName(input, state);
        break;
    }
  }

  async function inputMarket(input: MultiStepInput, state: Partial<State>) {
    state.market = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 3,
      totalSteps: 8,
      value: state.market || "",
      prompt: "Enter Market",
      validate: validateInput,
      shouldResume: shouldResume,
    });
    switch (state.operattionalCommand.label) {
      case "buildTemplate":
        const command = `mcdev ${state.operattionalCommand.label} ${state.credentialName}/${state.businessUnit} ${state.type} ${state.key} ${state.market}`;
        console.log(command.trim());
        return terminal.sendText(command.trim());
        break;
      case "retrieveAsTemplate":
      case "buildDefinition":
        const command2 = `mcdev ${state.operattionalCommand.label} ${state.credentialName}/${state.businessUnit} ${state.type}  ${state.name} ${state.market}`;
        console.log(command2.trim());
        return terminal.sendText(command2);
    }
  }

  async function inputName(input: MultiStepInput, state: Partial<State>) {
    state.name = await input.showInputBox({
      ignoreFocusOut: true,
      title,
      step: 3,
      totalSteps: 8,
      value: state.name || "",
      prompt: "Enter Name",
      validate: validateInput,
      shouldResume: shouldResume,
    });
    switch (state.operattionalCommand.label) {
      default:
        return (input: MultiStepInput) => inputMarket(input, state);
    }
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>((resolve, reject) => {
      // noop
    });
  }

  async function validateInput(value: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    value = value.trim();
    return !value ? "Please enter the indicated information" : undefined;
  }

  await collectInputs();
}
