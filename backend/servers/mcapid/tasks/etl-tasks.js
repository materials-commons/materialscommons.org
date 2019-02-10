const {api, Task} = require('actionhero');

module.exports.ProcessSpreadsheetTask = class ProcessSpreadsheetTask extends Task {
    constructor() {
        super();
        this.name = 'processSpreadsheet';
        this.description = 'Performs ETL on a spreadsheet';
        this.frequency = 0;
        this.queue = 'etl';
    }

    async run(data) {
        api.log('data = ', 'info', data);
        api.log(`ProcessSpreadsheetTask ${data.arg}`);
    }
};