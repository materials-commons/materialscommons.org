const {api, Task} = require('actionhero');
const spawn = require('@lib/spawn');

module.exports.PublishDatasetToGlobusTask = class PublishDatasetToGlobusTask extends Task {
    constructor() {
        super();
        this.name = 'publish-ds-to-globus';
        this.description = 'Publish dataset to globus';
        this.frequency = 0;
        this.queue = 'datasets';
    }

    async run(dsArgs) {
        let args = ['create-globus-dataset', '--project-id', dsArgs.projectId, '--dataset-id', dsArgs.datasetId,
            '--db-connection', process.env.MCDB_CONNECTION, '--mcdir', process.env.MCDIR];
        try {
            api.mc.log.info('mcdsbuild', args);
            await spawn.runCmd('../../prodbin/mcdsbuild', args);
            return true;
        } catch (e) {
            api.mc.log.info(`Failed to publish dataset to globus ${e}`);
            return false;
        }
    }
};

// module.exports.PublishDatasetToZipfileTask = class PublishDatasetToZipfileTask extends Task {
//
// }