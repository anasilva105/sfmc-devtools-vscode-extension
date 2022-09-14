import { exec } from 'child_process';

export function execInTerminal(command: string){
    return new Promise((resolve, reject) => {
        const process = exec(command);
        let result = '';
        process.stdout.on('data', function(data) {
            result += data.toString();
        });
        process.on('close', function(code) {
            resolve(result);
        }); 
    });
}