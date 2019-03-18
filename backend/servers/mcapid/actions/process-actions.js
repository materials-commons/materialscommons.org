const {Action, api} = require('actionhero');

module.exports.CreateProcessAction = class CreateProcessAction extends Action {
    constructor() {
        super();
        this.name = 'createProcess';
        this.description = 'creates a new process';
        this.inputs = {};
    }

    async run({response, params}) {
        response.data = '';
    }
};