GenericWatcher = require('./GenericWatcher.js');

class PublicationWatcher extends GenericWatcher{
    constructor() {
        super();
        this.table_name = 'datasets';
    }

    filter(x) {
        let old_value = x.old_val?x.old_val.published:false;
        let new_value = x.new_val?x.new_val.published:false;
        let change = (old_value != new_value);
        return change;
    }

    action(delta) {
        let old_value = delta.old_val?delta.old_val.published:false;
        let new_value = delta.new_val?delta.new_val.published:false;
        let name = delta.old_val?delta.old_val.title:(delta.new_val?delta.new_val.title:"unkn");
        let message = "from " + (old_value?"Published":"Unpublished")
            + " to " + (new_value?"Published":"Unpublished");
        console.log(name + ": " + message);
    }
}

module.exports = PublicationWatcher;