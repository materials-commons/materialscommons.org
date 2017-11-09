const GenericWatcher = require('./GenericWatcher');
const file_converter = require('./file_converter');

class FileWatcher extends GenericWatcher {
    constructor(parameters) {
        super(parameters);
        this.table_name = 'datafiles';
    }

    filter(delta) {
        return true;
    }

    action(delta) {
        let verbose_flag = this.verbose();
        let isDelete = delta.new_val === null;
        let created = (delta.old_val === null) && delta.new_val;
        if (verbose_flag) {
            let name = delta.old_val ? delta.old_val.name : (delta.new_val ? delta.new_val.name : "unkn");
            let message = created ? "to be created" : "to be deleted";
            console.log(name + ": " + message);
        }
        if (isDelete) {
            file_converter.delete_file_conversion_if_exists(
                delta.old_val, this.parameters.get_mc_dir_paths(), {verbose: verbose_flag});
        } else {
            let f = delta.new_val.mediatype.mime !== '' ? delta.new_val : delta.old_val;
            if (f) {
                file_converter.convert_file_if_needed(f, this.parameters.get_mc_dir_paths(), {verbose: verbose_flag});
            }
        }
    }
}

module.exports = FileWatcher;