const Router = require('koa-router');
const fileUtils = require('../../lib/create-file-utils');
const fsExtra = require('fs-extra');
const httpStatus = require('http-status');
const fs = require('fs');
const ra = require('./resource-access');

function* downloadFile(next) {
    let file = this.reqctx.file;
    let mediatype = '';
    let found = false;

    const filePaths = fileUtils.datafilePathsFromFile(file, this.params.original);
    for (let i = 0; i < filePaths.length; i++) {
        let filePath = filePaths[i];
        if (yield fsExtra.pathExists(filePath)) {
            if (this.params.original) {
                mediatype = file.mediatype.mime;
            } else if (fileUtils.isOfficeDoc(file.mediatype.mime)) {
                mediatype = 'application/pdf';
            } else if (fileUtils.isConvertedImage(file.mediatype.mime)) {
                mediatype = 'image/jpeg';
            } else {
                mediatype = file.mediatype.mime;
            }

            if (mediatype === 'application/pdf' && !this.params.original) {
                this.set('Content-Disposition', `inline; filename="filename.pdf"`)
            }

            this.set('Content-Type', mediatype);
            this.body = fs.createReadStream(filePath);
            found = true;
            break;
        }
    }

    if (!found) {
        this.status = httpStatus.NOT_FOUND;
        this.body = {error: `File not found - name: '${file.name}, id: ${file.id}`};
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
