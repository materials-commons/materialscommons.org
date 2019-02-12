// const {Action, api} = require('actionhero');
//
// module.exports.ProcessSpreadsheetAction = class ProcessSpreadsheetAction extends Action {
//     constructor() {
//         super();
//         this.name = 'processSpreadsheet';
//         this.description = 'Queues a spreadsheet for ETL processing';
//         this.do_not_authenticate = true;
//     }
//
//     async run({response}) {
//         const enqueued = await api.tasks.enqueue('processSpreadsheet', {arg: 'arg1'}, 'default');
//         response.data = {enqueued: enqueued};
//     }
// };