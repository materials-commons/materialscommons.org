const {Initializer, api} = require('actionhero');
const r = require('../../shared/r');
const access = require('../lib/dal/access');
const projectAccessCache = require('../lib/project-access-cache')(access);

module.exports = class APIKeyInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'process-acess';
        this.startPriority = 1010;
    }

    initialize() {
        const middleware = {
            name: this.name,
            global: true,
            preProcessor: async (data) => {
                if (data.actionTemplate.do_not_authenticate) {
                    return;
                }

                if (!data.params.project_id) {
                    return;
                }

                const project = await projectAccessCache.find(data.params.project_id);
                if (!project) {
                    throw new Error(`No such project ${data.params.project_id}`);
                }

                if (!projectAccessCache.validateAccess(data.params.project_id, data.user)) {
                    throw new Error(`No access to project ${data.params.project_id}`);
                }
            }
        };

        r.table('access').changes().toStream().on('data', function() {
            projectAccessCache.clear();
        });

        r.table('projects').changes().toStream().on('data', function() {
            projectAccessCache.clear();
        });

        api.actions.addMiddleware(middleware);
    }
};
