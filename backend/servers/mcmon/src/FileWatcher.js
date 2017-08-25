GenericWatcher = require('./GenericWatcher.js');

class FileWatcher extends GenericWatcher{
    constructor() {
        super();
        this.table_name = 'datafiles';
    }

    filter(delta) {
        let created = (delta.old_val == null) && delta.new_val;
        let deleted = (delta.new_val == null) && delta.old_val;
        let change = created || deleted;
        return change;
    }

    action(delta) {
        let created = (delta.old_val == null) && delta.new_val;
        let name = delta.old_val?delta.old_val.name:(delta.new_val?delta.new_val.name:"unkn");
        let message = created?"was created":"was deleted";
        console.log(name + ": " + message);
    }
}

module.exports = FileWatcher;