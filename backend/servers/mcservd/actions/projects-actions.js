const {Action} = require('actionhero');

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
    }

    async run({response, params}) {

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
