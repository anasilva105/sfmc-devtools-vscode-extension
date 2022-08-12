import { window, ViewColumn, Uri, ExtensionContext, ProgressLocation } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function initHelper(context: ExtensionContext){
    let response = await window.showInformationMessage("Do you want to initialize sfmc-devtools?", ...["Yes", "No"]);
    if(response.toLocaleLowerCase() === "yes"){
        initializeSFMCDevtools(context);
    }
}

function initializeSFMCDevtools(context: ExtensionContext){
    
    const panel = window.createWebviewPanel(
        'initPanel',
        'Initialize SFMC Devtools',
        ViewColumn.One,
        { // Enable scripts in the webview
            enableScripts: true, //Set this to true if you want to enable Javascript. 
        }
    );

    const filePath = Uri.file(path.join(context.extensionPath, 'src', 'html', 'mcdev_initialize.html'));
    let html = fs.readFileSync(filePath.fsPath, 'utf8').toString();

    const stylePathOnDisk = Uri.file(path.join(context.extensionPath, 'dist/design-system/styles/salesforce-lightning-design-system.css'));
    const styleUri = panel.webview.asWebviewUri(stylePathOnDisk);

    html = html.replace("{{styleUri}}", styleUri.toString());

    const jsPathOnDisk = Uri.file(path.join(context.extensionPath, 'src', 'js', 'mcdev_initialize.js'));
    const jsUri = panel.webview.asWebviewUri(jsPathOnDisk);

    html = html.replace("{{jsUri}}", jsUri.toString());


    panel.webview.html = html;
}