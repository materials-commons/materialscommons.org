const Promise = require("bluebird");
const fsa = Promise.promisifyAll(require("fs"));
const rimraf = require('rimraf');
const achiver = require('archiver');
const r = require('./r');

const mkdirpAsync = Promise.promisify(require('mkdirp'));

// forward ref
let is_image_to_convert, is_office_doc;
let convert_image_if_needed, convert_office_doc_if_needed;
let delete_file_conversion

function convert_file_if_needed(file){
    console.log('Converting file',file.id);
    if (is_image_to_convert(file)) {
        Promise.coroutine(convert_image_if_needed)(file);
    }
    else if (is_office_doc(file)) {
        Promise.coroutine(convert_office_doc_if_needed)(file);
    }
    console.log('Done converting file',file.id);
}

function delete_file_conversion_if_exists(file) {
    console.log('Removing file conversions for',file.id);
    Promise.coroutine(delete_file_conversion)(file);
    console.log('Done removing file conversions',file.id);
}

module.exports = [convert_file_if_needed, delete_file_conversion_if_exists];

function is_image_to_convert(file){
    let convert_me =
        (file.mediatype.mime == "image/tiff") ||
        (file.mediatype.mime == "image/x-ms-bmp") ||
        (file.mediatype.mime == "image/bmp");
    console.log("image file to convert?", file.id, convert_me);
    return convert_me;
}

function is_office_doc(file){
    let convert_me =
        (file.mediatype.mime == "application/vnd.ms-excel") ||
        (file.mediatype.mime == "application/vnd.ms-powerpoint) ||
        (file.mediatype.mime == "application/msword") ||
        (file.mediatype.mime == "application/vnd.openxmlformats-officedocument.presentationml.presentation") ||
        (file.mediatype.mime == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet) ||
        (file.mediatype.mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document);
    console.log("office file to convert?", convert_me);
    return convert_me;
}

function* convert_image_if_needed(file) {
    console.log("image conversion if needed", file.id);
}

function* convert_office_doc_if_needed(file) {
    console.log("office conversion if needed", file.id);
}

function* delete_file_conversion(file) {
}