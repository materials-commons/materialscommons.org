const files = require('../../db/model/files');
const check = require('../../db/model/check');
const parse = require('co-body');
const httpStatus = require('http-status');
const ra = require('../resource-access');
const Router = require('koa-router');

// used by file sender - download()
const fs = require('fs');
const fileUtils = require('../../../lib/create-file-utils');

// get retrieves a file.
function* get(next) {
    this.body = yield files.get(this.params.file_id);
    yield next;
}

function* getList(next) {
    let args = yield parse(this);
    this.body = yield files.getList(this.params.project_id, args.file_ids);
    yield next;
}

function* getVersions(next) {
    if (yield check.fileInProject(this.params.file_id, this.params.project_id)) {
        let rv = yield files.getVersions(this.params.file_id);
        if (rv.error) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = rv;
        } else {
            this.body = {versions: rv.val};
        }
    } else {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: 'Unknown file'};
    }

    yield next;
}

function* download(next) {
    if (yield check.fileInProject(this.params.file_id, this.params.project_id)) {
        let file = yield files.get(this.params.file_id);
        if (file.error) {
            this.status = httpStatus.BAD_REQUEST;
            this.body = file;
        } else {
            let contentType = file.mediatype.mime;
            let filename = file.name;
            let id = file.id;
            if (file.usesid !== "") {
                id = file.usesid;
            }
            let size = file.size;
            this.set('Content-Type',contentType);
            this.set('Content-Disposition', 'attachment; filename=' + filename);
            this.set('Content-Length',size);

            let filepath = fileUtils.datafilePath(id);

            if (yield fileUtils.datafilePathExists(id)) {
                this.body = fs.createReadStream(filepath);
            } else {
                this.status = httpStatus.NOT_FOUND;
                this.body = {error: 'File not found: ' + filename};
            }
        }
    } else {
        this.status = httpStatus.BAD_REQUEST;
        this.body = {error: 'Unknown file'};
    }
    yield next;
}

// put will update certain file fields. To see which fields can be updated look
// at the files.put method.
function* update(next) {
    let file = yield parse(this);
    let rv = yield files.update(this.params.file_id, this.params.project_id, this.reqctx.user.id, file);
    if (rv.error) {
        this.throw(httpStatus.BAD_REQUEST, rv.error);
    }
    this.body = rv.val;
    yield next;
}

// deleteFile will attempt to delete the named file.
function* deleteFile(next) {
    let rv = yield files.deleteFile(this.params.file_id);
    if (rv.error) {
        this.throw(httpStatus.BAD_REQUEST, rv.error);
    }
    this.body = rv.val;
    yield next;
}

function* byPath(next) {
    let args = yield parse(this);
    let rv = yield files.byPath(this.params.project_id, args.file_path);
    if (rv.error) {
        this.throw(httpStatus.BAD_REQUEST, rv.error);
    }
    this.body = rv.val;
    yield next;
}

function createResource() {
    const router = new Router();

    router.post('/', getList);
    router.put('/by_path', ra.validateProjectAccess, byPath);

    router.use('/:file_id', ra.validateFileInProject);
    router.get('/:file_id', get);
    router.get('/:file_id/versions', getVersions);
    router.get('/:file_id/download', download);
    router.put('/:file_id', update);
    router.delete('/:file_id', deleteFile);


    return router;
}

module.exports = {
    createResource
};
