const {Action, api} = require('actionhero');
const dal = require('@dal');
const _ = require('lodash');

module.exports.DeleteProjectAction = class DeleteProjectAction extends Action {
    constructor() {
        super();
        this.name = 'deleteProject';
        this.description = 'Delete a project (only the project owner can delete a project)';
        this.inputs = {
            project_id: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.isProjectOwner(params.project_id, user.id)) {
            throw new Error(`User is not owner of project ${params.project_id}`);
        }

        let deleted = await dal.tryCatch(async() => await api.mc.projects.deleteProject(params.project_id));
        if (!deleted) {
            throw new Error(`Unable to delete project ${params.project_id}`);
        }

        response.data = {success: `Project ${params.project_id} was deleted`};
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
                default: '',
                validator: (param) => {
                    if (!_.isString(param)) {
                        throw new Error(`description must be a string: ${param}`);
                    }
                },
            }
        };
    }

    async run({response, params, user}) {
        const project = await dal.tryCatch(async() => await api.mc.projects.createProject(user.id, params.name, params.description));
        if (!project) {
            throw new Error(`Unable to create project`);
        }
        response.data = project;
    }
};

module.exports.GetProjectOverviewByNameAction = class GetProjectOverviewByNameAction extends Action {
    constructor() {
        super();
        this.name = 'getProjectOverviewByName';
        this.description = 'Get details for the named project. User must be the owner of the project.';
        this.inputs = {
            name: {
                required: true
            }
        };
    }

    async run({response, params, user}) {
        const project = await dal.tryCatch(async() => await api.mc.projects.getProjectOverviewByName(params.name, user.id));
        if (!project) {
            throw new Error(`No such project_id ${params.name}`);
        }

        response.data = project;
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
        };
    }

    async run({response, params}) {
        //**************************
        // Keep this code so it can be used once we start using redis for a cache
        //**************************
        //
        //api.mc.log('user', 'info', user);
        //console.log('api', api.mc.redis);
        //console.log(api.mc.redis.clients.client.getBuiltinCommands());
        // let project = await api.mc.redis.clients.client.get(params.project_id);
        // if (project === null) {
        //     project = await dal.tryCatch(async () => await projects.getProject(params.project_id));
        //     if (!project) {
        //         throw new Error(`No such project_id ${params.project_id}`);
        //     }
        //
        //     api.mc.redis.clients.client.set(params.project_id, JSON.stringify(project));
        // } else {
        //     project = JSON.parse(project);
        // }

        const project = await dal.tryCatch(async() => await api.mc.projects.getProject(params.project_id));
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
        const experiment = await dal.tryCatch(async() => await api.mc.projects.getProjectExperiment(params.project_id, params.experiment_id));
        if (!experiment) {
            throw new Error(`No such experiment ${params.experiment_id} for given project ${params.project_id}`);
        }

        response.data = experiment[0];
    }
};

module.exports.AddUserToProjectAction = class AddUserToProjectAction extends Action {
    constructor() {
        super();
        this.name = 'addUserToProject';
        this.description = 'Adds a user to the project';
        this.inputs = {
            project_id: {
                required: true,
            },

            user_id: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.isProjectOwner(params.project_id, user.id)) {
            throw new Error(`Cannot add user to project, you are not the project owner`);
        }

        if (!await api.mc.check.userExists(params.user_id)) {
            throw new Error(`No such user ${params.user_id}`);
        }

        let entry = await dal.tryCatch(async() => await api.mc.access.addUserToProject(params.user_id, params.project_id));
        if (!entry) {
            throw new Error(`Unable to add user ${params.user_id} to project ${params.project_id}`);
        }

        response.data = entry;
    }
};

module.exports.RemoveUserFromProjectAction = class RemoveUserFromProjectAction extends Action {
    constructor() {
        super();
        this.name = 'removeUserFromProject';
        this.description = 'Removes user from project';
        this.inputs = {
            project_id: {
                required: true,
            },

            user_id: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.isProjectOwner(params.project_id, user.id)) {
            throw new Error(`Cannot add user to project, you are not the project owner`);
        }

        let removed = await dal.tryCatch(async() => await api.mc.access.removeUserFromProject(params.user_id, params.project_id));
        if (!removed) {
            throw new Error(`Unable to remove user ${params.user_id} from project ${params.project_id}`);
        }

        response.data = {removed: removed};
    }
};

module.exports.TransferProjectOwnerAction = class TransferProjectOwnerAction extends Action {
    constructor() {
        super();
        this.name = 'transferProjectOwner';
        this.description = 'Transfers project owner';
        this.inputs = {
            project_id: {
                required: true,
            },

            to_user: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.isProjectOwner(params.project_id, user.id)) {
            throw new Error(`Cannot add user to project, you are not the project owner`);
        }

        if (!await api.mc.check.userExists(params.to_user)) {
            throw new Error(`User ${params.to_user} not found`);
        }

        let transferArgs = {
            projectId: params.project_id,
            toUser: params.to_user,
        };

        await api.tasks.enqueue('transfer-project-owner', transferArgs, 'admin');

        response.data = {transfer_started: true};
    }
};

module.exports.ProjectFilesChangedSinceAction = class ProjectFilesChangedSinceAction extends Action {
    constructor() {
        super();
        this.name = 'projectFilesChangedSince';
        this.description = 'Return files changed or new since given date';
        this.inputs = {
            project_id: {
                required: true,
            },

            from_date: {
                required: true,
            },

            to_date: {
                default: 'blank'
            }
        };
    }

    async run({response, params}) {
        let toDate = params.to_date === 'blank' ? null : params.to_date;
        let files = await dal.tryCatch(async() => await api.mc.projects.filesChangedSince(params.project_id, params.from_date, toDate));
        if (!files) {
            throw new Error(`Unable to retrieve file changes`);
        }

        response.data = files;
    }
};