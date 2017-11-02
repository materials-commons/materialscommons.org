const GenericWatcher = require('./generic-watcher.js');
const zip_file_builder = require('./zip-file-builder');

class PublicationWatcher extends GenericWatcher {
    constructor(parameters) {
        super(parameters);
        this.table_name = 'datasets';
    }

    filter(x) {
        let old_value = x.old_val ? x.old_val.published : false;
        let new_value = x.new_val ? x.new_val.published : false;
        let change = (old_value !== new_value);
        return change;
    }

    action(delta) {
        let verbose_flag = this.verbose();
        let old_value = delta.old_val ? delta.old_val.published : false;
        let new_value = delta.new_val ? delta.new_val.published : false;
        let name = delta.old_val ? delta.old_val.title : (delta.new_val ? delta.new_val.title : "unkn");
        let datasetId = delta.old_val ? delta.old_val.id : (delta.new_val ? delta.new_val.id : null);
        if (verbose_flag) {
            let message = "from " + (old_value ? "Published" : "Unpublished")
                + " to " + (new_value ? "Published" : "Unpublished");
            console.log(name + ": " + message);
        }
        if (!datasetId) {
            console.log("Failed to build zip file: no id available!");
            console.log(delta);
        }
        if (new_value) { // then published; so, build zip
            zip_file_builder.build_zip_file(datasetId, {verbose: verbose_flag});
        } else {
            zip_file_builder.remove_zip_file(datasetId, {verbose: verbose_flag});
        }
    }

}

module.exports = PublicationWatcher;
