const {Action} = require('actionhero');

module.exports = class ListDirectoriesAction extends Action {
    constructor() {
        super();
        this.name = 'listDirectories';
        this.description = 'List top level directories for user';
    }

    async run({response, params}) {

    }
};

module.exports = class CreateDirectoryAction extends Action {
    constructor() {
        super();
        this.name = 'createDirectory';
        this.description = 'Creates a directory';
    }

    async run({response, params}) {

    }
};

module.exports = class GetDirectoryAction extends Action {
    constructor() {
        super();
        this.name = 'getDirectory';
        this.description = 'Get directory and its immediate children directories and files';
    }

    async run({response, params}) {

    }
};

module.exports = class UpdateDirectoryAction extends Action {
    constructor() {
        super();
        this.name = 'updateDirectory';
        this.description = 'Updates directory metadata and allows files and sub directories to be added/deleted';
    }

    async run({response, params}) {

    }
};

module.exports = class DeleteDirectoryAction extends Action {
    constructor() {
        super();
        this.name = 'deleteDirectory';
        this.description = 'Deletes a directory - only leaf directory nodes may be deleted';
    }

    async run({response, params}) {

    }
};