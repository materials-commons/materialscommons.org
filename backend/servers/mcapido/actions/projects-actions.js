// noinspection JSUnusedLocalSymbols
const {Action, api} = require('actionhero');
const projects = require('../lib/dal/projects');
const dal = require('../lib/dal');
const _ = require('lodash');

module.exports.ListProjectsAction = class ListProjectsAction extends Action {
    constructor() {
        super();
        this.name = 'listProjects';
        this.description = 'Retrieve a list of projects user has access to';
    }

    async run({response, params}) {
        console.log("listProjects");
    }
};

module.exports.ListProjectsForAdminAction = class ListProjectsForAdmin extends Action {
    constructor() {
        super();
        this.name = "listProjectsForAdmin";
        this.description = 'Retrieve a list of projects for Admin Info, without regard to use id';
    }

    async run({response, params, user}) {
        if (! user.isAdmin) {
            throw new Error(`not admin user: ${user.id}`);
        }
        console.log("At ListProjectsForAdmin", user);
        const project_list = await dal.tryCatch(async () => await projects.getAll());
        console.log(project_list.length);
        response.data = project_list;
    }
};

module.exports.CreateProjectAction = class CreateProjectAction extends Action {
    constructor() {
        super();
        this.name = 'createProject';
        this.description = 'Create a new project owned by user';
        this.inputs = {
            name: {
                required: true,
                validator: (param) => {
                    if (!_.isString(param)) {
                        throw new Error(`name must be a string: ${param}`);
                    }

                    if (_.size(param) < 1) {
                        throw new Error(`name cannot be an empty string: ${param}`);
                    }
                }
            },
            description: {
                default: "",
                validator: (param) => {
                    if (!_.isString(param)) {
                        throw new Error(`description must be a string: ${param}`);
                    }
                },
            }
        }
    }

    async run({response, params, user}) {
        // const project = await dal.tryCatch(async () => await projects.createProject(user, params));
        // if (!project) {
        //     throw new Error(`Unable to create project`);
        // }
        // //api.redis.clients.client.set(project.id, JSON.stringify(project));
        // response.data = project;
    }
};

module.exports.GetProjectAction = class GetProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getProject';
        this.description = 'Get details for a given project';
        // this.do_not_authenticate = true;
        this.inputs = {
            project_id: {
                required: true,
                //validator: async () => false,
            },
        }
    }

    async run({response, params}) {
        //**************************
        // Keep this code so it can be used once we start using redis for a cache
        //**************************
        //
        //api.log('user', 'info', user);
        //console.log('api', api.redis);
        //console.log(api.redis.clients.client.getBuiltinCommands());
        // let project = await api.redis.clients.client.get(params.project_id);
        // if (project === null) {
        //     project = await dal.tryCatch(async () => await projects.getProject(params.project_id));
        //     if (!project) {
        //         throw new Error(`No such project_id ${params.project_id}`);
        //     }
        //
        //     api.redis.clients.client.set(params.project_id, JSON.stringify(project));
        // } else {
        //     project = JSON.parse(project);
        // }

        const project = await dal.tryCatch(async () => await projects.getProject(params.project_id));
        if (!project) {
            throw new Error(`No such project_id ${params.project_id}`);
        }
        response.data = project;
    }
};

module.exports.GetProjectExperimentAction = class GetProjectExperimentAction extends Action {
    constructor() {
        super();
        this.name = 'getProjectExperiment';
        this.description = 'Get experiment for a project';
        // this.do_not_authenticate = true;
        this.inputs = {
            project_id: {
                required: true,
            },
            experiment_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const experiment = await dal.tryCatch(async() => await projects.getProjectExperiment(params.project_id, params.experiment_id));
        if (!experiment) {
            throw new Error(`No such experiment ${params.experiment_id} for given project ${params.project_id}`);
        }

        response.data = experiment[0];
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
