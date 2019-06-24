const {api, Task} = require('actionhero');
const spawn = require('@lib/spawn');

module.exports.TransferProjectOwnerTask = class TransferProjectOwnerTask extends Task {
    constructor() {
        super();
        this.name = 'transfer-project-owner';
        this.description = 'Transfer owner of project';
        this.frequency = 0;
        this.queue = 'admin';
    }

    async run(transferArgs) {
        let [, port] = process.env.MCDB_CONNECTION.split(':');

        let args = ['--project', transferArgs.projectId, '--to-user', transferArgs.toUser,
            '--port', port];

        try {
            api.mc.log.info('transferowner.py', args);
            await spawn.runCmd('../../scripts/admin/transferowner.py', args);
            return true;
        } catch (e) {
            api.mc.log.info('Failed to transfer owner for project ${e}');
            return false;
        }
    }
};