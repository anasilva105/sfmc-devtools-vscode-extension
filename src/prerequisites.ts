/* eslint-disable @typescript-eslint/naming-convention */
import { execInTerminal } from './utils';

const PREREQUISITES: any = {
    node:{
        cmd_version: 'node --version',
        isValidVersion: (version: string) => version.match(/v\d*.\d*.\d*/)
    },
    git:{
        cmd_version: 'git --version',
        isValidVersion: (version: string) => version.match(/git version \d*.\d*.\d*.*/)
    }
};
export async function hasPrerequisitesHandler(command: any): Promise<boolean>{
    let prerequisitesList: any = [];
    if(!command){
        prerequisitesList = await Promise.all(Object.keys(PREREQUISITES).map(async (res) => {
            let result = await execInTerminal(PREREQUISITES[res].cmd_version);
            return PREREQUISITES[res].isValidVersion(result) !== null;
        }));
    }else{
        let result = await execInTerminal(PREREQUISITES[command].cmd_version);
        prerequisitesList.push(PREREQUISITES[command].isValidVersion(result) !== null);
    }
    return prerequisitesList.every((res: boolean) => res === true);
};

export async function hasDevtoolsInstalled(): Promise<boolean>{
    let result: any = await execInTerminal("mcdev --version");
    return result.match(/\d*.\d*.\d*/) !== null;
}

export async function runInstallDevtools(): Promise<boolean>{
    let result: any = await execInTerminal(`npm install -g mcdev`);
    return result;
}
