const directories = require('../../db/model/directories');
const schema = require('../../schema');
const parse = require('co-body');
const httpStatus = require('http-status');
const ra = require('../resource-access');
const Router = require('koa-router');

// used by file loader
const fileUtils = require('../../../lib/create-file-utils');
const uploadTmpDir = fileUtils.getTmpUploadDir(); // ends with '/'
const koaBody = require('koa-body')({
    multipart: true,
    formidable: {uploadDir: uploadTmpDir, hash: 'md5'},
    keepExtensions: true,
});

function* get(next) {
    let dirID = this.params.directory_id || 'top';
    if (dirID === 'all') {
        this.body = yield directories.getAll(this.params.project_id);
    } else {
        this.body = yield directories.get(this.params.project_id, dirID);
    }
    yield next;
}

function* getByName(next) {
    let nameArgs = yield parse(this);
    if (!nameArgs.name) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: `You must specify a directory path`};
    } else {
        this.body = yield directories.getByName(this.params.project_id, namesArgs.name);
    }

    yield next;
}

function* create(next) {
    let dirArgs = yield parse(this);
    dirArgs = prepareDirArgs(this.params.project_id, dirArgs);

    let errors = yield validateDirArgs(dirArgs);
    if (errors !== null) {
        this.status = httpStatus.BAD_REQUEST;
        this.body = errors;
    } else {
        let rv = yield directories.create(this.params.project_id, this.reqctx.project.name, dirArgs);
        if (rv.error) {
            this.status = httpStatus.NOT_ACCEPTABLE;
            this.body = rv;
        } else {
            this.body = {dirs: rv.val};
        }
    }
    yield next;
}

function* createMultipleSubDirectories(next) {
    let args = yield parse(this);
    let project_id = this.params.project_id;
    let directory_id = this.params.directory_id;
    let paths = args.paths;
    let results = [];
    let errors = null;
    for (let i = 0; i < paths.length; i++) {
        let path = paths[i];
        let dirArgs = {
            project_id: project_id,
            from_dir: directory_id,
            path: path
        };
        errors = yield validateDirArgs(dirArgs);
        if (errors !== null) {
            this.status = httpStatus.BAD_REQUEST;
            break;
        }
        let rv = yield directories.create(this.params.project_id, this.reqctx.project.name, dirArgs);
        if (rv.error) {
            errors = rv.error;
            this.status = httpStatus.NOT_ACCEPTABLE;
            break;
        } else {
            results = results.concat(rv.val);
        }
    }
    if (errors === null) {
        let table = {};
        for (let i = 0; i < results.length; i++) {
            let path = results[i].name;
            table[path] = results[i];
        }
        this.body = {val: table};
    } else {
        this.body = {error: errors};
    }
    yield next;
}

function prepareDirArgs(projectID, dirArgs) {
    schema.createDirectory.stripNonSchemaAttrs(dirArgs);
    dirArgs.project_id = projectID;
    return dirArgs;
}

function validateDirArgs(dirArgs) {
    return schema.createDirectory.validateAsync(dirArgs).then(function () {
        return null;
    }, function (errors) {
        return errors;
    });
}

function* update(next) {
    let updateArgs = yield parse(this);
    let errors = yield validateUpdateArgs(this.params.project_id, this.params.directory_id, updateArgs);
    if (errors !== null) {
        this.body = errors;
        this.status = httpStatus.BAD_REQUEST;
    } else {
        let rv = yield directories.update(this.params.project_id, this.params.directory_id, updateArgs);
        if (rv.error) {
            this.body = rv;
            this.status = httpStatus.NOT_ACCEPTABLE;
        } else {
            this.body = rv.val;
        }
    }

    yield next;
}

function* validateUpdateArgs(projectID, directoryID, updateArgs) {
    updateArgs.project_id = projectID;
    if (!updateArgs.move && !updateArgs.rename) {
        return {error: 'badly formed update args'};
    } else if (updateArgs.move) {
        updateArgs.move.project_id = projectID;
        updateArgs.move.directory_id = directoryID;
        schema.moveDirectory.stripNonSchemaAttrs(updateArgs.move);
        return yield validateMoveArgs(updateArgs.move);
    } else {
        updateArgs.rename.project_id = projectID;
        updateArgs.rename.directory_id = directoryID;
        schema.renameDirectory.stripNonSchemaAttrs(updateArgs.rename);
        return yield validateRenameArgs(updateArgs.rename);
    }
}

function validateMoveArgs(moveArgs) {
    return schema.moveDirectory.validateAsync(moveArgs).then(function () {
        return null;
    }, function (errors) {
        return errors;
    });
}

function validateRenameArgs(renameArgs) {
    return schema.renameDirectory.validateAsync(renameArgs).then(function () {
        return null;
    }, function (errors) {
        return errors;
    });
}

function* remove(next) {
    let projectID = this.params.project_id,
        dirID = this.params.directory_id,
        matches = yield directories.findInProject(projectID, null, dirID);
    if (!matches.length) {
        this.body = {error: 'Unknown directory'};
    } else if (yield directories.isEmpty(dirID)) {
        let rv = yield directories.remove(projectID, dirID);
        this.body = rv.error ? rv : {status: 'Directory deleted'};
    } else {
        this.body = {error: 'Directory not empty'};
    }

    // If body contains error then set status code.
    if (this.body.error) {
        this.status = httpStatus.BAD_REQUEST;
    }

    yield next;
}

function* uploadFileToProjectDirectory(next) {
    let projectID = this.params.project_id,
        directoryID = this.params.directory_id;

    let upload = this.request.body.files.file;
    let args = {
        name: upload.name,
        checksum: upload.hash,
        mediatype: fileUtils.mediaTypeDescriptionsFromMime(upload.type),
        filesize: upload.size,
        filepath: upload.path
    };

    //TODO: check for obvious errors and return error as above - tew
    let file = yield directories.ingestSingleLocalFile(projectID, directoryID, this.reqctx.user.id, args);

    this.body = file;
    yield next;
}

function createResource() {
    const router = new Router();

    router.get('/', get);
    router.post('/', create);

    router.post('/dir/byname', getByName);

    router.use('/:directory_id', ra.validateDirectoryInProject);
    router.get('/:directory_id', get);
    router.put('/:directory_id', update);
    router.delete('/:directory_id', remove);

    router.post('/:directory_id', createMultipleSubDirectories);

    router.post('/:directory_id/fileupload', koaBody, uploadFileToProjectDirectory);
    return router;
}

module.exports = {
    createResource
};
