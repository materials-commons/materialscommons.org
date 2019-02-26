'use strict';
const sanitize = require('sanitize-filename');

let base;
let zipDir;

function zipDirPath(dataset) {
    if (!zipDir) {
        let base = getBase();
        zipDir = base + 'zipfiles/';
    }
    if (!zipDir.endsWith('/')) {
        zipDir += '/';
    }
    return zipDir + dataset.id + '/';
}

function setZipDirPath(zipDirPath) {
    zipDir = zipDirPath;
}

function fullPathAndFilename(dataset) {
    let zipFilename = zipFilename(dataset);
    let zipDir = zipDirPath(dataset);
    return zipDir + zipFilename;
}

function zipFilename(dataset) {
    let title = dataset.title;
    let filename = sanitize(title);
    filename = cleanUpZipfileName(filename);
    return filename + '.zip';
}

function zipEntry(datafile) {   // sets fileName, filePath, and sourcePath
    let base = getBase();
    let writeName = sanitize(datafile.name);
    let readName = datafile.id;
    if (datafile.usesid) {
        readName = datafile.usesid;
    }
    let filePath = datafile.dir[0].name + '/';
    let parts = readName.split('-');
    let part = parts[1];
    let partA = part.substring(0, 2);
    let partB = part.substring(2);
    let path = base + '/' + partA + '/' + partB + '/' + readName;
    return {fileName: writeName, filePath: filePath, sourcePath: path, checksum: datafile.checksum};
}

function getBase() {
    if (base) return base;

    base = process.env.MCDIR;
    base = base.split(':')[0];

    if (!base) {
        throw new Error('Can not create zipfile for dataset: please show this message to a site adminstrator - \'MCDIR is not set in environment\' ');
    }

    if (!base.endsWith('/')) {
        base += '/';
    }
    return base;
}

function setBase(baseValue) {
    base = baseValue;
}

let cleanUpZipfileNameLengthThreshold = 60;

let cleanUpZipfileName = function(name) {
    // truncate, cleanly if possible
    if (name.length > cleanUpZipfileNameLengthThreshold) {
        // brake at last blank before cleanUpZipfileNameLengthThreshold
        let pos = name.lastIndexOf(' ', cleanUpZipfileNameLengthThreshold);
        if (pos > 11) {
            name = name.substring(0, pos - 1);
        } else {
            name = name.substring(0, cleanUpZipfileNameLengthThreshold);
        }
    }
    // remove blanks
    name = name.replace(/ /g, '_');
    return name;
};

module.exports = {
    zipDirPath,
    setZipDirPath,
    fullPathAndFilename,
    zipFilename,
    zipEntry,
    getBase,
    setBase,
};

