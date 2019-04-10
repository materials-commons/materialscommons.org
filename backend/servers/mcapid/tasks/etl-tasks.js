const {api, Task} = require('actionhero');
const {spawn} = require('child_process');

module.exports.TestTask = class TestTask extends Task {
    constructor() {
        super();
        this.name = 'testTask';
        this.description = 'Tests running a task';
        this.frequency = 0;
        this.queue = 'etl';
    }

    async run(args) {
        api.mc.log.info('Running testTask', args);
        return true;
    }
};

module.exports.ProcessSpreadsheetTask = class ProcessSpreadsheetTask extends Task {
    constructor() {
        super();
        this.name = 'processSpreadsheet';
        this.description = 'Performs ETL on a spreadsheet';
        this.frequency = 0;
        this.queue = 'etl';
    }

    async run(etlArgs) {
        try {
            api.mc.log.info('Starting ETL Job', etlArgs);
            await spawnEtlJob(etlArgs);
            return true;
        } catch (e) {
            api.mc.log.info(`Failed to process ETL Job ${e}`, etlArgs);
            return false;
        }
    }
};

async function spawnEtlJob(etlArgs) {
    return new Promise((resolve, reject) => {
        // example: pymcetl --apikey 124e09425cfe4c4287eff056e69c1dd1 --project 23b1eba7-425e-4ee0-a2a2-2ccdf6169920 --experiment E2 --spreadsheet /Pure_Mg_CHESS_MC.xlsx

        let child = spawn('pymcetl', ['--apikey', etlArgs.apikey, '--project', etlArgs.projectId, '--experiment', etlArgs.experimentName,
            '--spreadsheet', etlArgs.path]);
        child.stderr.on('data', data => api.mc.log.info(`Processing spreadsheet ${etlArgs.path}: ${data}`));
        child.stdout.on('data', data => api.mc.log.info(`Processing spreadsheet ${etlArgs.path}: ${data}`));
        child.on('close', exitCode => {
            if (exitCode === 0) {
                api.mc.log.info(`Successfully processed spreadsheet ${etlArgs.path}`);
                resolve();
            } else {
                api.mc.log.info(`Failed while processing spreadsheet ${etlArgs.path}`);
                reject();
            }
        });

        child.on('error', err => {
            api.mc.log.info(`Failed to start processing job for file ${etlArgs.path}: ${err}`);
            reject();
        });
    });
}