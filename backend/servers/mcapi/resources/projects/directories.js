const directories = require('../../db/model/directories');
const files = require('../../db/model/files');
const schema = require('../../schema');
const parse = require('co-body');
const httpStatus = require('http-status');
const ra = require('../resource-access');
const Router = require('koa-router');
const multiParse = require('co-busboy');
const fileUtils = require('../../../lib/create-file-utils')

function* get(next) {
    let dirID = this.params.directory_id || 'top';
    this.body = yield directories.get(this.params.project_id, dirID);
    yield next;
}

function* create(next) {
    let dirArgs = yield parse(this);
    dirArgs = prepareDirArgs(this.params.project_id, dirArgs);

    let errors = yield validateDirArgs(dirArgs);
    if (errors != null) {
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

function prepareDirArgs(projectID, dirArgs) {
    schema.createDirectory.stripNonSchemaAttrs(dirArgs);
    dirArgs.project_id = projectID;
    return dirArgs;
}

function validateDirArgs(dirArgs) {
    return schema.createDirectory.validateAsync(dirArgs).then(function() {
        return null;
    }, function(errors) {
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
    return schema.moveDirectory.validateAsync(moveArgs).then(function() {
        return null;
    }, function(errors) {
        return errors;
    });
}

function validateRenameArgs(renameArgs) {
    return schema.renameDirectory.validateAsync(renameArgs).then(function() {
        return null;
    }, function(errors) {
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
    // ref: http://stackoverflow.com/questions/33751203/how-to-parse-multipart-form-data-body-with-koa
    // 1. Create file record for new file with filename, size values, and other default initial values
    // 2. Compute store path using UUID of new file record
    // 3. Upload file and store in store location
    // 3. Compute checksum and add to file record
    // 4. Query DB for checksum on record with ‘usesid’ set to empty string -> matching record
    // 5. If matching record exists:
    //     - discard uploaded file
    // - set File record ‘usesid' value to the id of matching record
    // 6. Return File record

    // it's a stream, you can do something like:
    // part.pipe(fs.createWriteStream('some file.txt'));

    console.log("this request is multipart",this.request.is('multipart/*'));
    let directory = yield directories.get(this.params.project_id,this.params.directory_id);
    console.log(directory);

    let parts = multiParse(this,{
        autoFields: true
    });
    var part = yield parts;
    // it's a stream, you can do something like:
    // var saveTo = path.join(os.tmpDir(), path.basename(fieldname));
    // part.pipe(fs.createWriteStream(saveTo));
    console.log("part.filename = ",part.filename);
    console.log("part.mimeType = ",part.mime);

    let fileArgs = {
        name: part.filename,
        mediatype: fileUtils.mediaTypeDescriptionsFromMime(part.mimeType)
    };

    console.log("fileArgs = ",fileArgs);

    let file = yield files.create(fileArgs,this.reqctx.user.id)

    console.log("file = ",file );

    this.body = {};
    yield next;
}

function createResource() {
    const router = new Router();

    router.get('/', get);
    router.post('/', create);

    router.use('/:directory_id', ra.validateDirectoryInProject);
    router.get('/:directory_id', get);
    router.put('/:directory_id', update);
    router.delete('/:directory_id', remove);

    router.post('/:directory_id/fileupload', uploadFileToProjectDirectory);

    return router;
}

module.exports = {
    createResource
};
