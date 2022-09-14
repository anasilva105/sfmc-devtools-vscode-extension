import { hasPrerequisitesHandler, hasDevtoolsInstalled, runInstallDevtools } from './prerequisites';
import { window, ViewColumn, Uri, ExtensionContext, ProgressLocation } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function installHelper(context: ExtensionContext){

    
    // if user doesn't have prequisites installed
    const hasPrerequisites = await hasPrerequisitesHandler(null);
    if(!hasPrerequisites){
        // show prequisites installation page
        noPrerequisitesHandler(context);
    }else{
        // checks if it has devtools installed
        const hasDevtools = await hasDevtoolsInstalled();
        if(!hasDevtools){
            noDevToolsHandler(context);
        }else{
         //   initHelper(context);
        }
    }
}

async function noPrerequisitesHandler(context: ExtensionContext){
    let response = await window.showInformationMessage("You don't have the prerequisites necessary to run sfmc-devtool."
    + " Do you want to install them?", ...["Yes", "No"]);
    if(response.toLocaleLowerCase() === "yes"){
        const panel = window.createWebviewPanel(
            'prerequisitesPanel',
            'Prequisites Installation',
            ViewColumn.One,
            { // Enable scripts in the webview
                enableScripts: true, //Set this to true if you want to enable Javascript. 
            }
        );

        const filePath = Uri.file(path.join(context.extensionPath, 'src', 'html', 'mcdev_prerequisites.html'));
        let html = fs.readFileSync(filePath.fsPath, 'utf8').toString();

        const stylePathOnDisk = Uri.file(path.join(context.extensionPath, 'dist/design-system/styles/salesforce-lightning-design-system.css'));
        const styleUri = panel.webview.asWebviewUri(stylePathOnDisk);
        html = html.replace("{{styleUri}}", styleUri.toString());

        const jsPathOnDisk = Uri.file(path.join(context.extensionPath, 'src', 'js', 'mcdev_prerequisites.js'));
        const jsUri = panel.webview.asWebviewUri(jsPathOnDisk);
        html = html.replace("{{jsUri}}", jsUri.toString());
        
        panel.webview.onDidReceiveMessage(async message => {
            if(message.command === "install"){
                panel.dispose();
                await installSFMCDevtools();
          //      initHelper(context);
            }else{
                const result = await hasPrerequisitesHandler(message.command);
                panel.webview.postMessage({ command: message.command, result: result });
            }
        });
        panel.webview.html = html;
    }
}

async function noDevToolsHandler(context: ExtensionContext){
    let response = await window.showInformationMessage("Cannot find sfmc-devtools."
    + " Do you want to install it?", ...["Yes", "No"]);
    if(response.toLowerCase() === "yes"){
        await installSFMCDevtools();
      //  initHelper(context);
    }
}

async function installSFMCDevtools(){
    let res = await window.withProgress({
        location: ProgressLocation.Notification,
      }, async (progress) => {
        progress.report({
          message: `Installing sfmc-devtools...`,
        });
        let result = await runInstallDevtools();
        return result;
    });
    return res;
}