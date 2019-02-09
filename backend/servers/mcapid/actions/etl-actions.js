const {Action, api} = require('actionhero');

module.exports.QueueETLJobAction = class QueueETLJobAction extends Action {
    constructor() {
        super();
        this.name = 'queueETLJob';
        this.description = 'Queues a spreadsheet for ETL processing';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        const enqueued = await api.tasks.enqueue('etlSpreadsheetProcessorTask', {arg: 'arg1'}, 'default');
        response.data = {enqueued: enqueued};
    }
};