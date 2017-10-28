const Promise = require("bluebird");
const fs = require('fs');
const path = require('path');

const {exec} = require('child_process');
const mkdirpAsync = Promise.promisify(require('mkdirp'));

let verbose = true;

function is_image_to_convert(file) {
    let convert_me =
        (file.mediatype.mime === "image/tiff") ||
        (file.mediatype.mime === "image/x-ms-bmp") ||
        (file.mediatype.mime === "image/bmp");
    return convert_me;
}

function is_office_doc(file) {
    let convert_me =
        (file.mediatype.mime === "application/vnd.ms-excel") ||
        (file.mediatype.mime === "application/vnd.ms-powerpoint") ||
        (file.mediatype.mime === "application/msword") ||
        (file.mediatype.mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation") ||
        (file.mediatype.mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
        (file.mediatype.mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    return convert_me;
}

function derive_file_id(file) {
    if (file.usesid) {
        return file.usesid;
    }
    return file.id;
}

function conversion_dir_path_from(target_path, file) {
    let id = derive_file_id(file);
    let parts = id.split("-");
    let d1 = parts[1].substring(0, 2);
    let d2 = parts[1].substring(2, 4);
    return path.join(target_path, d1, d2, ".conversion")
}

function conversion_file_path_from(target_path, file, ext) {
    let id = derive_file_id(file);
    let conversion_dir_path = conversion_dir_path_from(target_path, file);
    return path.join(conversion_dir_path, id + '.' + ext);
}

function originating_file_path(file, mc_dir_list) {
    let id = derive_file_id(file);
    let parts = id.split("-");
    let d1 = parts[1].substring(0, 2);
    let d2 = parts[1].substring(2, 4);
    for (let i = 0; i < mc_dir_list.length; i++) {
        let dir = mc_dir_list[i];
        let probe_path = path.join(dir, d1, d2, id);
        if (fs.existsSync(probe_path))
            return probe_path
    }
    return null;
}

function converted_file_exists(mc_dir_list, file, ext) {
    for (let i = 0; i < mc_dir_list.length; i++) {
        let path_entry = mc_dir_list[i];
        let file_path = conversion_file_path_from(path_entry, file, ext);
        if (fs.existsSync(file_path)) {
            return file_path;
        }
    }
    return false;
}

function get_mcdir_from_path(file_path) {
    return path.dirname(path.dirname(path.dirname(file_path)));
}

function run_system_command(command) {
    return new Promise(function(resolve, reject) {
        const task = exec(command);
        task.stdout.on('data', (data) => {
            if (verbose) {
                console.log("task stdout", data.toString());
            }
        });

        task.stderr.on('data', (data) => {
            if (verbose) {
                console.log("task stderr", data.toString());
            }
        });

        task.on('exit', (code) => {
            if (verbose) {
                console.log(`task exited with code ${code}`);
            }
            resolve(code);
        });

        task.on('error', (error) => {
            if (verbose) {
                console.log(`task error detected: ${error}`);
            }
            reject(error);
        });
    });
}

function* convert_image_if_needed(file, mc_dir_list) {
    let retP = Promise.resolve();
    if (converted_file_exists(mc_dir_list, file, "jpg")) {
        console.log("File conversion exists", file.name, file.id);
        return retP;
    }
    let ofile_path = originating_file_path(file, mc_dir_list);
    if (!ofile_path) {
        console.log("File not in file store", file.name, file.id);
        return retP;
    }
    let ofile_mcdir = get_mcdir_from_path(ofile_path);
    yield mkdirpAsync(conversion_dir_path_from(ofile_mcdir, file));
    let command = "convert " +
        ofile_path + " " +
        conversion_file_path_from(ofile_mcdir, file, "jpg");

    try {
        yield run_system_command(command);
        console.log("Create image thumbnail for:", file.name);
        return retP;
    } catch (error) {
        return Promise.reject("Error in convert execution: " + error.message);
    }
}

function* convert_office_doc_if_needed(file, mc_dir_list) {
    let retP = Promise.resolve();
    if (converted_file_exists(mc_dir_list, file, "pdf")) {
        console.log("File conversion exists", file.name, file.id);
        return retP;
    }
    let ofile_path = originating_file_path(file, mc_dir_list);
    if (!ofile_path) {
        console.log("File not in file store", file.name, file.id);
        return retP;
    }
    let ofile_mcdir = get_mcdir_from_path(ofile_path);
    let target_dir = conversion_dir_path_from(ofile_mcdir, file);
    yield mkdirpAsync(target_dir);

    let id = derive_file_id(file);
    let tmpdir = "/tmp";
    let tmppath = path.join(tmpdir, id);
    let converted_file_path = path.join(tmpdir, id + ".pdf");

    let command = "libreoffice" +
        " -env:UserInstallation=file://" + tmppath +
        " --headless" +
        " --convert-to pdf" +
        " --outdir " + tmpdir +
        " " + ofile_path + " ; " +
        "cp " + converted_file_path + " " + target_dir + " ; " +
        "rm " + converted_file_path;

    if (verbose) {
        console.log("Running command ", command);
    }
    try {
        yield run_system_command(command);
        console.log("Create office file thumbnail for:", file.name);
    } catch (error) {
        return Promise.reject("Error in libreoffice execution: " + error.message);
    }
    return retP;
}

function* delete_file_conversion(file, mc_dir_list) {
    let retP = Promise.resolve();

    // only delete thumbnails of where the file no longer exists
    let ofile_path = originating_file_path(file, mc_dir_list);
    if (ofile_path) {
        console.log("Skipping delete. Originating file still exists file store", ofile_path);
        return retP;
    }

    if (verbose) {
        console.log("Deleteing thumbnail image for:", file.name, file.id);
    }

    let pdf_file_path = converted_file_exists(mc_dir_list, file, "pdf");
    let jpg_file_path = converted_file_exists(mc_dir_list, file, "jpg");
    if ((!pdf_file_path) && (!jpg_file_path)) {
        console.log('Thumbnail image not in file store', derive_file_id(file));
        return retP;
    }

    let file_path = pdf_file_path ? pdf_file_path : jpg_file_path;
    let dir = path.dirname(file_path);

    let command = "rm -r " + dir;

    try {
        yield run_system_command(command);
    } catch (error) {
        return Promise.reject("Error in command execution: " + error.message);
    }
    return retP;
}

function convert_file_if_needed(file, mc_dir_list, options) {
    if (is_verbose_muted(options)) verbose = false;
    if (verbose) {
        console.log('Thumbnail conversion', file.name, file.id);
    }
    if (is_image_to_convert(file)) {
        Promise.coroutine(convert_image_if_needed)(file, mc_dir_list);
    }
    else if (is_office_doc(file)) {
        Promise.coroutine(convert_office_doc_if_needed)(file, mc_dir_list);
    }
}

// Note: delay needed on delete because backing file is deleted after database change
// this leads to a race condition in which the file's being present
// prevents the thumbnail from being deleted. Wait for the case that the backing file
// is deleted, to allow the corresponding thumbnail to be deleted.

let delay = 1000; // one second

function delayed_conditional_thumbnail_delete(file, mc_dir_list) {
    if (verbose) {
        console.log('Removing thumbnail for', file.name, file.id);
    }
    Promise.coroutine(delete_file_conversion)(file, mc_dir_list);
    console.log('Done removing thumbnail for', file.name);
}

function delete_file_conversion_if_exists(file, mc_dir_list, options) {
    if (is_verbose_muted(options)) verbose = false;
    setTimeout(delayed_conditional_thumbnail_delete, delay, file, mc_dir_list)
}

function is_verbose_muted(options) {
    return (options && (options.verbose === false));
}

module.exports = {
    convert_file_if_needed,
    delete_file_conversion_if_exists
};
