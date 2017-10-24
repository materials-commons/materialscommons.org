const Router = require('koa-router');
const fileUtils = require('../../lib/create-file-utils');
const fsExtra = require('fs-extra');
const httpStatus = require('http-status');
const fs = require('fs');
const ra = require('./resource-access');

function* downloadFile(next) {
    let file = this.reqctx.file;
    this.set('Content-Type', file.mediatype.mime);
    this.set('Content-Disposition', 'attachment; filename=' + file.name);
    this.set('Content-Length', file.size);

    let filepath = fileUtils.datafilePathFromFile(file, this.params.original);
    if (yield fsExtra.pathExists(filePath)) {
        this.body = fs.createReadStream(filepath);
    } else {
        this.status = httpStatus.NOT_FOUND;
        this.body = {error: 'File not found: ' + filename};
    }
    yield next;
}

function createResource() {
    const router = new Router();
    router.get('/:file_id/download', ra.validateFileAccess, downloadFile);
    return router;
}


module.exports = {
    createResource
};
