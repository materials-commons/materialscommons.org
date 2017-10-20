const Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));
const mkdirpAsync = Promise.promisify(require('mkdirp'));
const mkdirpSync = require('mkdirp');
const fileExistsSync = require('fs').existsSync;
const path = require('path');
const fsExtra = require('fs-extra');

function getFileStoreDir() {
    let base = process.env.MCDIR;
    base = base.split(':')[0];
    if (!base.endsWith('/')) {
        base += '/';
    }
    return base
}

// NOTE: dir for temp uploads should be in same file system
// as dir for file store; a rename is used to position the final
// version of the upload file - this is called at build time;
// ref: line 12 in directories.js
function getTmpUploadDir() {
    let path = getFileStoreDir() + "uploadTmp/";
    mkdirpSync(path);
    return path;
}

// note filesId must be the file record usesid, if this is set
// otherwise, it is the file record id
async function removeFileInStore(fileId) {
    return await fs.unlinkAsync(datafilePath(fileId));
}

async function removeFileByPath(path) {
    return await fs.unlinkAsync(path);
}

function datafilePath(fileId) {
    let base = getFileStoreDir();
    let part = fileId.split("-")[1];
    let partA = part.substring(0, 2);
    let partB = part.substring(2);
    let results = path.join(base, partA);
    results = path.join(results, partB);
    results = path.join(results, fileId);
    return results;
}

async function datafilePathExists(fileId) {
    let path = datafilePath(fileId);
    return fileExistsSync(path);
}

async function moveToStore(sourcePath, fileId) {
    let destPath = datafilePath(fileId);
    let destDir = path.dirname(destPath);
    await mkdirpAsync(destDir);
    await fsExtra.copy(sourcePath, destPath);
    await fs.unlinkAsync(sourcePath);
}

function mediaTypeDescriptionsFromMime(mime) {
    // if there is a semi-colen - strip media type of additional information
    let pos = mime.indexOf(';');
    if (pos > -1) {
        mime = mime.substring(pos - 1)
    }
    let description = mediaTypeDescriptions[mime];
    if (!description) {
        description = mime
    }
    return {
        description: description,
        mime: mime,
    }
}

const mediaTypeDescriptions = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Spreadsheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "Presentation",
    "Composite Document File V2 Document, No summary info": "Composite Document File",
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12": "MS-PowerPoint",
    "text/xml": "XML",
    "image/jpeg": "JPEG",
    "application/postscript": "Postscript",
    "image/png": "PNG",
    "application/json": "JSON",
    "image/vnd.ms-modi": "MS-Document Imaging",
    "application/vnd.ms-xpsdocument": "MS-Postscript",
    "image/vnd.radiance": "Radiance",
    "application/vnd.sealedmedia.softseal.pdf": "Softseal PDF",
    "application/vnd.hp-PCL": "PCL",
    "application/xslt+xml": "XSLT",
    "image/gif": "GIF",
    "application/matlab": "Matlab",
    "application/pdf": "PDF",
    "application/xml": "XML",
    "application/vnd.ms-excel": "MS-Excel",
    "image/bmp": "BMP",
    "image/x-ms-bmp": "BMP",
    "image/tiff": "TIFF",
    "image/vnd.adobe.photoshop": "Photoshop",
    "application/pkcs7-signature": "PKCS",
    "image/vnd.dwg": "DWG",
    "application/octet-stream": "Binary",
    "application/rtf": "RTF",
    "text/plain": "Text",
    "application/vnd.ms-powerpoint": "MS-PowerPoint",
    "application/x-troff-man": "TROFF",
    "video/x-ms-wmv": "WMV Video",
    "application/vnd.chemdraw+xml": "ChemDraw",
    "text/html": "HTML",
    "video/mpeg": "MPEG Video",
    "text/csv": "CSV",
    "application/zip": "ZIP",
    "application/msword": "MS-Word",
    "unknown": "Unknown",
};

module.exports = {
    getFileStoreDir,
    getTmpUploadDir,
    moveToStore,
    datafilePath,
    datafilePathExists,
    removeFileInStore,
    removeFileByPath,
    mediaTypeDescriptionsFromMime,
};