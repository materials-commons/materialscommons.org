const PublicationWatcher = require('./PublicationWacher');
const UserWatcher = require('./UserWatcher');
const FileWatcher = require('./FileWatcher');
const CommentWatcher = require('./CommentWatcher');

class Builder {
    constructor(parameters) {
        this.watch_list = [
            new PublicationWatcher(parameters),
// TODO: advance User Watcher to admin-like user monitoring.
//            new UserWatcher(parameters),
            new FileWatcher(parameters),
            new CommentWatcher(parameters)
        ]
    }

    get_watch_list() {
        return this.watch_list;
    }

}

module.exports = Builder;