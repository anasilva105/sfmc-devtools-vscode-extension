const vscode = acquireVsCodeApi();

function completedStep(buttonId){
    let command = buttonId.split("-")[0];
    if(!document.getElementById(buttonId).classList.contains("slds-button_success")){
        vscode.postMessage({
            command: command
        });
    }
}

function installDevtools(){
    vscode.postMessage({ command: "install"});
}

function handleCommandResult(command, result){
    if(result){
        let element = document.getElementById(command+"-completeStep-button");
        element.classList.remove("slds-button_outline-brand");
        element.classList.add("slds-button_success");
        element.innerHTML = "Completed";
    }
    const completedSteps = Array.from(document.querySelectorAll("[id$=-completeStep-button]"));
    let allCompleted = completedSteps.every(element => element.classList.contains("slds-button_success") === true);
    if(allCompleted){
        document.getElementById("sfmc-devtools-install-button").removeAttribute("disabled");
    }
}

window.addEventListener('message', event => {
    const message = event.data;
    if(message.result){
        handleCommandResult(message.command, message.result);
    }else{
        // show error
    }
});