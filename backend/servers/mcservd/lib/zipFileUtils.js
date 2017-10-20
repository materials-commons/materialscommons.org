'use strict'
const sanitize = require("sanitize-filename");

let base;
let zipDir;

module.exports.zipDirPath = function(dataset) {
    if (!zipDir) {
        const base = module.exports.getBase();
        zipDir = base + "zipfiles/";
    }
    if (!zipDir.endsWith('/')) {
        zipDir += '/';
    }
    return zipDir + dataset.id + "/";
};

module.exports.setZipDirPath = function(zipDirPath) {
    zipDir = zipDirPath;
};

module.exports.fullPathAndFilename = function(dataset) {
    const zipFilename = module.exports.zipFilename(dataset);
    const zipDir = module.exports.zipDirPath(dataset);
    return zipDir + zipFilename;
};

module.exports.zipFilename = function(dataset) {
    const title = dataset.title;
    let filename = sanitize(title);
    filename = cleanUpZipfileName(filename);
    return filename + ".zip";
};

module.exports.zipEntry = function(datafile) {   // sets fileName, filePath, and sourcePath
    const base = module.exports.getBase();
    const writeName = sanitize(datafile.name);
    let readName = datafile.id;
    if (datafile.usesid) {
        readName = datafile.usesid;
    }
    const filePath = datafile.dir[0].name + "/";
    const parts = readName.split("-");
    const part = parts[1];
    const partA = part.substring(0, 2);
    const partB = part.substring(2);
    const path = base + "/" + partA + "/" + partB + "/" + readName;
    return {fileName: writeName, filePath: filePath, sourcePath: path, checksum: datafile.checksum};
};

module.exports.getBase = function() {
    if (base) return base;

    base = process.env.MCDIR;
    base = base.split(':')[0];

    if (!base) {
        throw new Error({message: "Can not create zipfile for dataset: please show this message to a site adminstrator - 'MCDIR is not set in environment' "});
    }

    if (!base.endsWith('/')) {
        base += '/';
    }
    return base;
};

module.exports.setBase = function(baseValue) {
    base = baseValue;
};

let cleanUpZipfileNameLengthThreshold = 60;

let cleanUpZipfileName = function(name) {
    // truncate, cleanly if possible
    if (name.length > cleanUpZipfileNameLengthThreshold) {
        // brake at last blank before cleanUpZipfileNameLengthThreshold
        let pos = name.lastIndexOf(" ", cleanUpZipfileNameLengthThreshold);
        if (pos > 11) {
            name = name.substring(0, pos - 1);
        } else {
            name = name.substring(0, cleanUpZipfileNameLengthThreshold);
        }
    }
    // remove blanks
    name = name.replace(/ /g, "_");
    return name;
};

