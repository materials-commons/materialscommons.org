const {Action} = require('actionhero');

module.exports.GetDirectoryForProjectAction = class GetDirectoryForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'ui:getDirectoryForProject';
        this.description = 'Retrieves contents of the given directory for a project';
    }

    async run() {}
};

module.exports.GetFilesForDirectoryAction = class GetFilesForDirectoryAction extends Action {
    constructor() {
        super();
        this.name = 'ui:getFilesForDirectory';
        this.description = 'Retrieves the files for a directory';
    }

    async run() {}
};

