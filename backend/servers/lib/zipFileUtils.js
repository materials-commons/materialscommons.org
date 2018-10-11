'use strict'
const sanitize = require("sanitize-filename");

var base;
var zipDir;

module.exports.zipDirPath = function(dataset) {
    if (!zipDir) {
        var base = module.exports.getBase();
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
    var zipFilename = module.exports.zipFilename(dataset);
    var zipDir = module.exports.zipDirPath(dataset);
    return zipDir + zipFilename;
};

module.exports.zipFilename = function(dataset) {
    var title = dataset.title;
    var filename = sanitize(title);
    filename = cleanUpZipfileName(filename);
    return filename + ".zip";
};

module.exports.zipEntry = function(datafile) {   // sets fileName, filePath, and sourcePath
    var base = module.exports.getBase();
    var writeName = sanitize(datafile.name);
    var readName = datafile.id;
    if (datafile.usesid) {
        readName = datafile.usesid;
    }
    var filePath = datafile.dir[0].name + "/";
    var parts = readName.split("-");
    var part = parts[1];
    var partA = part.substring(0, 2);
    var partB = part.substring(2);
    var path = base + "/" + partA + "/" + partB + "/" + readName;
    return {fileName: writeName, filePath: filePath, sourcePath: path, checksum: datafile.checksum};
};

module.exports.getBase = function() {
    if (base) return base;

    base = process.env.MCDIR;
    base = base.split(':')[0];

    if (!base) {
        throw new Error("Can not create zipfile for dataset: please show this message to a site adminstrator - 'MCDIR is not set in environment' ");
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
        var pos = name.lastIndexOf(" ", cleanUpZipfileNameLengthThreshold);
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

