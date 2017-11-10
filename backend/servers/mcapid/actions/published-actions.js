const {Action} = require('actionhero');

module.exports.ListPublishedAction = class ListPublishedAction extends Action {
    constructor() {
        super();
        this.name = 'listPublished';
        this.description = 'List all published projects and views';
    }

    async run({response, params}) {

    }
};

module.exports.ListPublishedProjectsAction = class ListPublishedProjectsAction extends Action {
    constructor() {
        super();
        this.name = 'listPublishedProjects';
        this.description = 'List published projects';
    }

    async run({response, params}) {

    }
};

module.exports.GetPublishedProjectAction = class GetPublishedProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getPublishedProject';
        this.description = 'Get published project';
    }

    async run({response, params}) {

    }
};

module.exports.ListPublishedProjectViewsAction = class ListPublishedProjectViewsAction extends Action {
    constructor() {
        super();
        this.name = 'listPublishedProjectViews';
        this.description = 'List published project views';
    }

    async run({response, params}) {

    }
};

module.exports.GetPublishedProjectViewAction = class GetPublishedProjectViewAction extends Action {
    constructor() {
        super();
        this.name = 'getPublishedProjectView';
        this.description = 'Get published project view';
    }

    async run({response, params}) {

    }
};

module.exports.ListPublishedViewsAction = class ListPublishedViewsAction extends Action {
    constructor() {
        super();
        this.name = 'listPublishedViews';
        this.description = 'List published views';
    }

    async run({response, params}) {

    }
};

module.exports.GetPublishedViewAction = class GetPublishedViewAction extends Action {
    constructor() {
        super();
        this.name = 'getPublishedView';
        this.description = 'Get published view';
    }

    async run({response, params}) {

    }
};