const GenericWatcher = require('./GenericWatcher.js');
const commentNotifier = require('./commentNotifier.js');

class CommentWatcher extends GenericWatcher{
    constructor(parameters) {
        super(parameters);
        this.table_name = 'comments';
    }

    filter(x) {
        let old_value = x.old_val?true:false;
        let new_value = x.new_val?true:false;
        let trigger = (new_value && !old_value);
        return trigger;
    }

    action(delta) {
        let verbose_flag = this.verbose();
        let new_value = delta.new_val;
        let owner = new_value.owner;
        let id = new_value.item_id;
        let type = new_value.item_type;
        let text = new_value.text;
        if (verbose_flag) {
            console.log(this.table_name, owner, "comment: ", text);
        }
        // notify all owners of previous comments on this item of the new comment
        commentNotifier.notifyOtherUsers(owner,id);
    }
}

module.exports = CommentWatcher;