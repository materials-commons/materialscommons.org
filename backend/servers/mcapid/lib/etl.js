const {spawn} = require('child_process');
let {api} = require('actionhero');

async function spawnJob(cmd, args, path) {
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
            log.push(`Failed to start processing job for file ${path}: ${err}`);
            api.mc.log.info(log);
            reject(log);
        });
    });
}

async function checkSpreadsheet(path, hasParent) {
    let args = ['check', '--files', path], output, success;
    if (hasParent) {
        args.push('--has-parent');
    }
    try {
        output = await spawnJob('../../prodbin/mcetl', args, path);
        success = true;
    } catch (e) {
        api.mc.log.info('spawnJob failed', e);
        output = e;
        success = false;
    }

    return {output, success};
}

module.exports = {
    checkSpreadsheet,
};