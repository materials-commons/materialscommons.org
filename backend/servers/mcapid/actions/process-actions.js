const {Action, api} = require('actionhero');
const dal = require('@dal');

module.exports.CreateProcessAction = class CreateProcessAction extends Action {
    constructor() {
        super();
        this.name = 'createProcess';
        this.description = 'creates a new process';
        this.inputs = {
            project_id: {
                required: true,
            },

            name: {
                required: true,
            },

            experiment_id: {
                required: true,
            },

            attributes: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        let process = await dal.tryCatch(async() => await api.mc.processes.createProcess(params.project_id, params.experiment_id, params.name, user.id, params.attributes));
        if (!process) {
            throw new Error(`Unable to create process`);
        }

        response.data = process;
    }
};