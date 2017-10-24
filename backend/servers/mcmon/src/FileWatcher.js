const GenericWatcher = require('./GenericWatcher');
const file_converter = require('./file_converter');

class FileWatcher extends GenericWatcher {
    constructor(parameters) {
        super(parameters);
        this.table_name = 'datafiles';
    }

    filter(delta) {
        let created = (delta.old_val === null) && delta.new_val;
        let deleted = (delta.new_val === null) && delta.old_val;
        let change = created || deleted;
        return change;
    }

    action(delta) {
        let verbose_flag = this.verbose();
        let created = (delta.old_val === null) && delta.new_val;
        if (verbose_flag) {
            let name = delta.old_val ? delta.old_val.name : (delta.new_val ? delta.new_val.name : "unkn");
            let message = created ? "to be created" : "to be deleted";
            console.log(name + ": " + message);
        }
        if (created) {
            file_converter.convert_file_if_needed(
                delta.new_val, this.parameters.get_mc_dir_paths(), {verbose: verbose_flag});
        } else {
            file_converter.delete_file_conversion_if_exists(
                delta.old_val, this.parameters.get_mc_dir_paths(), {verbose: verbose_flag});
        }
    }
}

module.exports = FileWatcher;