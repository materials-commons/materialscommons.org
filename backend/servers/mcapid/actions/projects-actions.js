const {Action, api} = require('actionhero');
const projects = require('../lib/dal/projects');
const dal = require('../lib/dal');

module.exports.ListProjectsAction = class ListProjectsAction extends Action {
    constructor() {
        super();
        this.name = 'listProjects';
        this.description = 'Retrieve a list of projects user has access to';
    }

    async run({response, params}) {

    }
};

module.exports.CreateProjectAction = class CreateProjectAction extends Action {
    constructor() {
        super();
        this.name = 'createProject';
        this.description = 'Create a new project owned by user';
    }

    async run({response, params}) {

    }
};

module.exports.GetProjectAction = class GetProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getProject';
        this.description = 'Get details for a given project';
        //this.do_not_authenticate = true;
        this.inputs = {
            project_id: {
                required: true,
                //validator: async () => false,
            },
        }
    }

    async run({response, params, user}) {
        //api.log('user', 'info', user);
        //console.log('api', api.redis);
        //console.log(api.redis.clients.client.getBuiltinCommands());
        let project = await api.redis.clients.client.get(params.project_id);
        if (project === null) {
            project = await dal.tryCatch(async () => await projects.getProject(params.project_id));
            if (!project) {
                throw new Error(`No such project_id ${params.project_id}`);
            }

            api.redis.clients.client.set(params.project_id, JSON.stringify(project));
        } else {
            project = JSON.parse(project);
        }
        response.data = project;
    }
};

module.exports.UpdateProjectAction = class UpdateProjectAction extends Action {
    constructor() {
        super();
        this.name = 'updateProject';
        this.description = 'Update given project';
    }

    async run({response, params}) {

    }
};

module.exports.DeleteProjectAction = class DeleteProjectAction extends Action {
    constructor() {
        super();
        this.name = 'deleteProject';
        this.description = 'Delete the given project';
    }

    async run({response, params}) {

    }
};

module.exports.CloneProjectAction = class CloneProjectAction extends Action {
    constructor() {
        super();
        this.name = 'cloneProject';
        this.description = 'Create project by cloning from the given project';
    }

    async run({response, params}) {

    }
};

module.exports.GetProjectViewsAction = class GetProjectViewsAction extends Action {
    constructor() {
        super();
        this.name = 'getProjectViews';
        this.description = 'Returns a list of the projects view';
    }

    async run({response, params}) {

    }
};

module.exports.UpdateProjectViewsAction = class UpdateProjectViewsAction extends Action {
    constructor() {
        super();
        this.name = 'updateProjectViews';
        this.description = 'Update views by adding/deleting views associated with project';
    }

    async run({response, params}) {

    }
};
