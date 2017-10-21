const {Action} = require('actionhero');

module.exports = class CreateFileAction extends Action {
    constructor() {
        super();
        this.name = 'createFile';
        this.description = 'Creates a new file - nothing has been uploaded';
    }

    async run({response, params}) {

    }
};

module.exports = class GetFileAction extends Action {
    constructor() {
        super();
        this.name = 'getFile';
        this.description = 'Gets the meta data for a file';
    }

    async run({response, params}) {

    }
};

module.exports = class UpdateFileAction extends Action {
    constructor() {
        super();
        this.name = 'updateFile';
        this.description = 'Updates metadata about a file';
    }

    async run({response, params}) {

    }
};

module.exports = class DeleteFileAction extends Action {
    constructor() {
        super();
        this.name = 'deleteFile';
        this.description = 'Deletes a file';
    }

    async run({response, params}) {

    }
};

module.exports = class DownloadFileAction extends Action {
    constructor() {
        super();
        this.name = 'downloadFile';
        this.description = 'Downloads the physical file';
    }

    async run({response, params}) {

    }
};

module.exports = class UploadFileAction extends Action {
    constructor() {
        super();
        this.name = 'uploadFile';
        this.description = 'Uploads a file and creates a new file entry';
    }

    async run({response, params}) {

    }
};

module.exports = class UploadFileByIdAction extends Action {
    constructor() {
        super();
        this.name = 'File';
        this.description = 'Uploads a file to the given file id only if there is not a file already uploaded';
    }

    async run({response, params}) {

    }
};