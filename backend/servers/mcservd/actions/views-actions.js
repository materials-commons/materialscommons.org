const {Action} = require('actionhero');

module.exports = class ListViewsAction extends Action {
    constructor() {
        super();
        this.name = 'listViews';
        this.description = 'List views for user'
    }

    async run({response, params}) {

    }
};

module.exports = class CreateViewAction extends Action {
    constructor() {
        super();
        this.name = 'createView';
        this.description = 'Create a new view';
    }

    async run({response, params}) {

    }
};

module.exports = class GetViewAction extends Action {
    constructor() {
        super();
        this.name = 'getView';
        this.description = 'Gets details for view';
    }

    async run({response, params}) {

    }
};

module.exports = class UpdateViewAction extends Action {
    constructor() {
        super();
        this.name = 'updateView';
        this.description = 'Updates a view';
    }

    async run({response, params}) {

    }
};

module.exports = class DeleteViewAction extends Action {
    constructor() {
        super();
        this.name = 'deleteView';
        this.description = 'Deletes a view';
    }

    async run({response, params}) {

    }
};

module.exports = class CloneViewAction extends Action {
    constructor() {
        super();
        this.name = 'cloneView';
        this.description = 'Clones a view from the given view';
    }

    async run({response, params}) {

    }
};