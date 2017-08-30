const Promise = require("bluebird");
const fsa = Promise.promisifyAll(require("fs"));
const rimraf = require('rimraf');
const achiver = require('archiver');
const r = require('./r');

const mkdirpAsync = Promise.promisify(require('mkdirp'));

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
        (file.mediatype.mime == "application/vnd.ms-powerpoint") ||
        (file.mediatype.mime == "application/msword") ||
        (file.mediatype.mime == "application/vnd.openxmlformats-officedocument.presentationml.presentation") ||
        (file.mediatype.mime == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
        (file.mediatype.mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    console.log("office file to convert?", convert_me);
    return convert_me;
}

function* converted_file_exists(mc_dir_list, file, ext) {
    for (let i=0; i < mc_dir_list.length; i++) {
        let path_entry = mc_dir_list[i];
        let file_path = conversion_file_path_from(path_entry, file, ext);
        if (yield file_exists(file_path)) {
            return true;
        }
    }
    return false;
}

function* run_system_command(command) {
    console.log("Running command",command);
}

function* convert_image_if_needed(file, mc_dir_list) {
    console.log("image conversion if needed", file.id, mc_dir_list);
    if (yield converted_file_exists(mc_dir_list, file, "jpg")){
        return;
    } else if (file.usesid) {
        return;
    }
    let ofile_path = originating_file_path(f)
    if (! ofile_path) {
        console.log("Unknown file name", file.name, file.id);
        return;
    }
    ofile_mcdir = get_mcdir_from_path(ofile_path);
    yield mkdirp(conversion_dir_path_from(ofile_mcdir, file));
    let command = "convert " + originating_file_path(file)
        + " " + conversion_file_path_from(ofile_mcdir, file, "jpg");
    run_system_command(command);
}

function* convert_office_doc_if_needed(file, mc_dir_list) {
    console.log("office conversion if needed", file.id, mc_dir_list);
}

function* delete_file_conversion(file) {
    console.log("Delete conversion file - unimplemented");
}

function convert_file_if_needed(file, mc_dir_list){
    console.log('Converting file',file.id);
    if (is_image_to_convert(file)) {
        Promise.coroutine(convert_image_if_needed)(file, mc_dir_list);
    }
    else if (is_office_doc(file)) {
        Promise.coroutine(convert_office_doc_if_needed)(file, mc_dir_list);
    }
    console.log('Done converting file',file.id);
}

function delete_file_conversion_if_exists(file) {
    console.log('Removing file conversions for',file.id);
    Promise.coroutine(delete_file_conversion)(file);
    console.log('Done removing file conversions',file.id);
}

module.exports = {
    convert_file_if_needed,
    delete_file_conversion_if_exists
};
