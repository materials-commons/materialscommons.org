const _ = require('lodash');
const mcdir = require('./mcdir');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');
const path = require('path');
const fsExtra = require('fs-extra');

const convertibleImageFileTypes = {
    'image/tiff': true,
    'image/x-ms-bmp': true,
    'image/bmp': true,
};

const convertibleDocumentFileTypes = {
    'application/vnd.ms-excel': true,
    'application/vnd.ms-powerpoint': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
};

const spreadsheetDocumentFileTypes = {
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
};

async function convertFile(file) {
    if (isDocumentFile(file)) {
        return await convertDocumentFile(file);
    }

    if (isImageFile(file)) {
        return await convertImageFile(file);
    }

    // If there isn't a match on files that we convert then return false
    return false;
}

function convertDocumentCommand(file) {
    // We use libreoffice to convert the file word/excel/powerpoint file to pdf. The command
    // syntax is a bit odd. Basically we are telling libreoffice to convert the file that is
    // stored in the storage repository. The file is stored with the name as the file.id. For
    // example as 15f43a89-7d25-4cc2-a4db-54dc158ffd62. The conversion process writes the file
    // to os.tmpdir with a .pdf extension. After the conversion is done we need to copy the file
    // to the path where the original file is stored + .conversion dir. For example, lets
    // say the original file is stored at:
    // /mcfs/7d/25/15f43a89-7d25-4cc2-a4db-54dc158ffd62
    // Then the converted version will be stored at:
    // /mcfs/7d/25/.converson/15f43a89-7d25-4cc2-a4db-54dc158ffd62.pdf
    //
    let tmpConvertedFile = path.join(os.tmpdir(), file.id + '.pdf');
    let command = 'libreoffice ' +
        ` -env:UserInstallation=file://${path.join(os.tmpdir(), file.id)}` +
        ` --headless ` +
        ` --convert-to pdf ` +
        ` --outdir ${os.tmpdir()} ` +
        ` ${mcdir.pathToFileId(file.id)};` +
        ` cp ${tmpConvertedFile} ${mcdir.conversionDir(file.id)}; ` +
        ` rm ${tmpConvertedFile}`;
    return command;
}

async function convertDocumentFile(file) {
    await fsExtra.ensureDir(mcdir.conversionDir(file.id));
    let command = convertDocumentCommand(file);
    return await execAsync(command);
}

function convertImageCommand(file) {
    let command = `convert ${mcdir.pathToFileId(file.id)} ${path.join(mcdir.conversionDir(file.id), file.id + '.jpg')}`;
    return command;
}

async function convertImageFile(file) {
    await fsExtra.ensureDir(mcdir.conversionDir(file.id));
    let command = convertImageCommand(file);
    return await execAsync(command);
}

async function execAsync(command) {
    try {
        await exec(command);
        return true;
    } catch (e) {
        return false;
    }
}

function isDocumentFile(file) {
    return _.has(convertibleDocumentFileTypes, file.mediatype.mime);
}

function isImageFile(file) {
    return _.has(convertibleImageFileTypes, file.mediatype.mime);
}

function isConvertibleFileType(mimeType) {
    return _.has(convertibleImageFileTypes, mimeType) || _.has(convertibleDocumentFileTypes, mimeType);
}

function isSpreadsheet(mimeType) {
    return _.has(spreadsheetDocumentFileTypes, mimeType);
}

module.exports = {
    isSpreadsheet,
    isConvertibleFileType,
    convertFile,
    convertDocumentCommand,
    convertImageCommand,
};