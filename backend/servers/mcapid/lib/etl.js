let {api} = require('actionhero');
const spawn = require('./spawn');

async function checkSpreadsheet(path, hasParent, projectId, apikey) {
    let args = ['check', '--files', path, '--mcurl', process.env.MCURL, '--apikey', apikey, '--project-id', projectId], output, success;
    if (hasParent) {
        args.push('--has-parent');
    }
    try {
        output = await spawn.runCmd('../../prodbin/mcetl', args);
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