const {spawn} = require('child_process');
const {api} = require('actionhero');

async function runCmd(cmd, args) {
    return new Promise((resolve, reject) => {
        api.mc.log.info(cmd, args);
        let child = spawn(cmd, args);
        let log = '';
        child.stderr.on('data', data => {
            let entry = '' + data;
            log = log + entry;
            api.mc.log.info(entry);
        });
        child.stdout.on('data', data => {
            let entry = '' + data;
            log = log + entry;
            api.mc.log.info(entry);
        });
        child.on('close', exitCode => {
            api.mc.log.info('exitCode', exitCode);
            if (exitCode === 0) {
                resolve(log);
            } else {
                reject(log);
            }
        });

        child.on('error', err => {
            log.push(`Failed to run cmd ${cmd} with args ${args}: ${err}`);
            api.mc.log.info(log);
            reject(log);
        });
    });
}

module.exports = {
    runCmd,
};