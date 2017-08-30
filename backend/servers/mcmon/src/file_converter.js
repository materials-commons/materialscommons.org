const Promise = require("bluebird");
const fsa = Promise.promisifyAll(require("fs"));
const rimraf = require('rimraf');
const achiver = require('archiver');
const r = require('./r');
const fs = require('fs');
const path = require('path');

const { exec } = require('child_process');
const { spawn } = require('child_process');
const mkdirpAsync = Promise.promisify(require('mkdirp'));
const execAsync = Promise.promisify(exec);

function is_image_to_convert(file){
    let convert_me =
        (file.mediatype.mime == "image/tiff") ||
        (file.mediatype.mime == "image/x-ms-bmp") ||
        (file.mediatype.mime == "image/bmp");
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
    return convert_me;
}

function derive_file_id(file){
    if (file.usesid) {
        return file.usesid;
    }
    return file.id;
}

function conversion_dir_path_from(target_path, file){
    let id = derive_file_id(file);
    let parts = id.split("-");
    let d1 = parts[1].substring(0,2);
    let d2 = parts[1].substring(2,4);
    return path.join(target_path, d1, d2, ".conversion")
}

function conversion_file_path_from(target_path, file, ext) {
    let id = derive_file_id(file);
    conversion_dir_path = conversion_dir_path_from(target_path, file);
    return path.join(conversion_dir_path,id + '.' + ext);
}

function originating_file_path(file, mc_dir_list){
    let id = derive_file_id(file);
    let parts = id.split("-");
    let d1 = parts[1].substring(0,2);
    let d2 = parts[1].substring(2,4);
    for (let i = 0; i < mc_dir_list.length; i++) {
        let dir = mc_dir_list[i];
        let probe_path = path.join(dir, d1, d2, id)
        if (fs.existsSync(probe_path))
            return probe_path
    }
    return null;
}

function converted_file_exists(mc_dir_list, file, ext) {
    for (let i=0; i < mc_dir_list.length; i++) {
        let path_entry = mc_dir_list[i];
        let file_path = conversion_file_path_from(path_entry, file, ext);
        if (fs.existsSync(file_path)) {
            return true;
        }
    }
    return false;
}

function get_mcdir_from_path(file_path){
    return path.dirname(path.dirname(path.dirname(file_path)));
}

function run_system_command(command, args) {
    return new Promise(function (resolve, reject) {
        const task = spawn(command, args);
        task.stdout.on('data', (data) => {
            console.log("task stdout", data.toString());
        });

        task.stderr.on('data', (data) => {
            console.log("task stderr", data.toString());
        });

        task.on('exit', (code) => {
            console.log(`task exited with code ${code}`);
            resolve(code);
        });

        task.on('error', (error) => {
            console.log(`task error detected: ${error}`);
            reject(error);
        });
    });
}

function* convert_image_if_needed(file, mc_dir_list) {
    let retP = Promise.resolve()
    if (converted_file_exists(mc_dir_list, file, "jpg")){
        console.log("File conversion exists", file.name, file.id);
        return retP;
    }
    let ofile_path = originating_file_path(file, mc_dir_list);
    if (! ofile_path) {
        console.log("File not in file store", file.name, file.id);
        return retP;
    }
    ofile_mcdir = get_mcdir_from_path(ofile_path);
    yield mkdirpAsync(conversion_dir_path_from(ofile_mcdir, file));
    let command = "convert -verbose " + ofile_path
        + " " + conversion_file_path_from(ofile_mcdir, file, "jpg");
    command = "convert";
    args = [ofile_path, conversion_file_path_from(ofile_mcdir, file, "jpg")];

    try {
        ret = yield run_system_command(command,args);
        return retP;
    } catch (error) {
        return Promise.reject("Error in command execution: " + error.message);
    }
}

function* convert_office_doc_if_needed(file, mc_dir_list) {
    console.log("office conversion if needed", file.id, mc_dir_list);
}

function* delete_file_conversion(file) {
    console.log("Delete conversion file - unimplemented");
}

function convert_file_if_needed(file, mc_dir_list){
    console.log('Thumbnail conversion',file.name, file.id);
    if (is_image_to_convert(file)) {
        Promise.coroutine(convert_image_if_needed)(file, mc_dir_list);
    }
    else if (is_office_doc(file)) {
        Promise.coroutine(convert_office_doc_if_needed)(file, mc_dir_list);
    }
    console.log('Done converting file',file.name);
}

function delete_file_conversion_if_exists(file) {
    console.log('Removing file conversions for',file.name, file.id);
    Promise.coroutine(delete_file_conversion)(file);
    console.log('Done removing file conversions',file.name);
}

module.exports = {
    convert_file_if_needed,
    delete_file_conversion_if_exists
};
