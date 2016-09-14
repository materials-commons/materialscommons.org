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
    return filename + ".zip";
}

module.exports.zipEntry = function(datafile) {   // sets fileName and sourcePath
    var base = getBase();
    var writeName = sanitize(datafile.name);
    var readName = datafile.id;
    var parts = datafile.id.split("-");
    var part = parts[1];
    var partA = part.substring(0, 2);
    var partB = part.substring(2);
    var path = base + "/" + partA + "/" + partB + "/" + readName;
    return {fileName: writeName, sourcePath: path};
};

let getBase = function() {
    var base = process.env.MCDIR;
    if (!base) {
        throw new Error({message: "Can not create zipfile for dataset: please relay to admin - 'MCDIR is not set in environment' "});
    }
    return base;
};