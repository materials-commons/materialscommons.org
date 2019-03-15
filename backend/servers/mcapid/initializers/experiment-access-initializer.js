const {Initializer, api} = require('actionhero');
const {setStatusCode} = require('@lib/connection-helpers');
const status = require('http-status');
const dal = require('@dal');

module.exports = class ExperimentAccessInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'experiment-access';
        this.startPriority = 1120;
        this.loadPriority = 1100;
    }

    initialize() {
        const middleware = {
            name: this.name,
            globus: true,
            preProcessor: async(data) => {
                if (!data.params.project_id) {
                    return;
                }

                if (!data.params.experiment_id) {
                    return;
                }

                let inProject = await dal.tryCatch(async() => await api.mc.check.experimentInProject(data.params.experiment_id, data.params.project_id));
                if (!inProject) {
                    setStatusCode(data.connection, status.UNAUTHORIZED);
                    throw new Error(`No access to experiment ${data.params.experiment_id} in project ${data.params.project_id}`);
                }
            }
        };

        api.actions.addMiddleware(middleware);
    }
};