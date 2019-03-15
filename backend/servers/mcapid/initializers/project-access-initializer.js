const {Initializer, api} = require('actionhero');
const {setStatusCode} = require('@lib/connection-helpers');
const status = require('http-status');

module.exports = class ProjectAccessInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'project-access';
        this.startPriority = 1110;
        this.loadPriority = 1100;
    }

    initialize() {
        const projectAccessCache = require('@lib/project-access-cache')(api.mc.access);
        let r = api.mc.r;

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
                    setStatusCode(data.connection, status.BAD_REQUEST);
                    throw new Error(`No such project ${data.params.project_id}`);
                }

                if (!projectAccessCache.validateAccess(data.params.project_id, data.user)) {
                    setStatusCode(data.connection, status.UNAUTHORIZED);
                    throw new Error(`No access to project ${data.params.project_id}`);
                }

                data.projectAccess = project;
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
