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

    const filePaths = fileUtils.datafilePathsFromFile(file, this.query.original);
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

            if (mediatype === 'application/pdf' && !this.query.original) {
                this.set('Content-Disposition', `inline; filename="${file.name}.pdf"`);
            }

            this.set('Content-Type', mediatype);
            this.body = fs.createReadStream(filePath);
            found = true;
            break;
        }
    }

    if (!found) {
        this.status = httpStatus.NOT_FOUND;
        let message = "File is currently unavailable. ";
        message += "In the case of file content display, a conversion file is needed, try later ";
        message += `- name: '${file.name}', id: ${file.id}`;
        this.body = {error: message};
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
