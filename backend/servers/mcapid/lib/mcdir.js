const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const _ = require('lodash');

function findFile(fileId) {
    let dirs = getMCDirs();
    for (let dir of dirs) {
        let filepath = constructPathToFileId(dir, fileId);
        if (fs.existsSync(filepath)) {
            return filepath;
        }
    }

    return null;
}

function deleteFile(fileId) {
    let filePath = findFile(fileId);
    if (!filePath) {
        return false;
    }

    try {
        fs.unlinkSync(filePath);
    } catch (e) {
        console.log('unlink error', e);
        return false;
    }
    return true;
}

async function moveIntoStore(filePath, fileId) {
    let mcdirs = getMCDirs();
    let fileLocation = constructPathToFileId(mcdirs[0], fileId);
    let dirToFile = path.join(mcdirs[0], constructFileDirSubPathFromFile(fileId));
    await fsExtra.ensureDir(dirToFile);
    await fsExtra.move(filePath, fileLocation);
}

let mcdirsOverride = [];

function getMCDirs() {
    if (mcdirsOverride.length) {
        return mcdirsOverride;
    }
    return process.env.MCDIR.split(':');
}

function setMCDirs(dirs) {
    if (_.isArray(dirs)) {
        mcdirsOverride = _.clone(dirs);
    } else if (_.isString(dirs)) {
        mcdirsOverride.push(dirs);
    }
}

function constructPathToFileId(dir, fileId) {
    return path.join(dir, constructFileDirSubPathFromFile(fileId), fileId);
}

function pathToFileId(fileId) {
    let mcdirs = getMCDirs();
    return path.join(mcdirs[0], constructFileDirSubPathFromFile(fileId), fileId);
}

function fileDir(fileId) {
    let mcdirs = getMCDirs();
    return path.join(mcdirs[0], constructFileDirSubPathFromFile(fileId));
}

function conversionDir(fileId) {
    let mcdirs = getMCDirs();
    return path.join(mcdirs[0], constructFileDirSubPathFromFile(fileId), '.conversion');
}

function constructFileDirSubPathFromFile(fileId) {
    let part = fileId.split('-')[1];
    let partA = part.substring(0, 2);
    let partB = part.substring(2);
    return path.join(partA, partB);
}

module.exports = {
    findFile,
    deleteFile,
    moveIntoStore,
    conversionDir,
    pathToFileId,
    fileDir,
    getMCDirs,
    setMCDirs,
};