const sanitize = require("sanitize-filename");

module.exports.zipDirPath = function(dataset) {
    var base = getBase();
    var zipDir = base + "/zipfiles/" + dataset.id + "/";
    return zipDir;
};

module.exports.fullPathAndFilename = function(dataset) {
    var zipFilename = module.exports.zipFilename(dataset);
    var zipDir = module.exports.zipDirPath(dataset);
    return zipDir + zipFilename;
}

module.exports.zipFilename = function(dataset) {
    var title = dataset.title;
    var filename = sanitize(title);
    filename = cleanUpZipfileName(filename);
    return filename + ".zip";
}

module.exports.zipEntry = function(datafile) {   // sets fileName and sourcePath
    var base = getBase();
    var writeName = sanitize(datafile.name);
    var readName = datafile.id;
    if (datafile.usesid) {
        readName = datafile.usesid;
    }
    var parts = readName.split("-");
    var part = parts[1];
    var partA = part.substring(0, 2);
    var partB = part.substring(2);
    var path = base + "/" + partA + "/" + partB + "/" + readName;
    return {fileName: writeName, sourcePath: path, checksum: datafile.checksum};
};

let cleanUpZipfileNameLengthThreshold = 60;
let cleanUpZipfileName = function(name){
    // truncate, cleanly if possible
    if (name.length > cleanUpZipfileNameLengthThreshold) {
        // brake at last blank before cleanUpZipfileNameLengthThreshold
        var pos = name.lastIndexOf(" ",cleanUpZipfileNameLengthThreshold);
        if (pos > 11) {
            name = name.substring(0,pos-1);
        } else {
            name = name.substring(0,cleanUpZipfileNameLengthThreshold);
        }
    }
    // remove blanks
    name = name.replace(/ /g,"_");
    return name;
}

let getBase = function() {
    var base = process.env.MCDIR;
    if (!base) {
        throw new Error({message: "Can not create zipfile for dataset: please show this message to a site adminstrator - 'MCDIR is not set in environment' "});
    }
    return base;
};