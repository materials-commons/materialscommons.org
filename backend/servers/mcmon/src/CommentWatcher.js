const GenericWatcher = require('./GenericWatcher.js');
const commentNotifier = require('./commentNotifier.js');

class CommentWatcher extends GenericWatcher{
    constructor(parameters) {
        super(parameters);
        this.table_name = 'comments';
    }

    filter(x) {
        let trigger = (x.new_val && (!x.old_val));
        return trigger;
    }

    action(delta) {
        let verbose_flag = this.verbose();
        let comment = delta.new_val;
        // notify all owners of previous comments on this item of the new comment
        // note: this is asynchronous, the call will return *before* the
        //   the notifications, if any, are sent.

        console.log("---------- Before call to notifyOtherUsers", comment.id);

        commentNotifier.notifyOtherUsers(comment);

        console.log("---------- After call to notifyOtherUsers", comment.id);
    }
}

module.exports = CommentWatcher;