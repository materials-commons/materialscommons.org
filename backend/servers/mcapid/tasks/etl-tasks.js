const {api, Task} = require('actionhero');

module.exports.ETLSpreadsheetProcessorTask = class ETLSpreadsheetProcessorTask extends Task {
    constructor() {
        super();
        this.name = 'etlSpreadsheetProcessorTask';
        this.description = 'Performs ETL on a spreadsheet';
        this.frequency = 0;
        this.queue = 'etl';
    }

    async run(data) {
        api.log('data = ', 'info', data);
        api.log(`etlSpreadsheetProcessTask ${data.arg}`);
    }
};