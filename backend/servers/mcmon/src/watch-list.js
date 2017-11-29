const PublicationWatcher = require('./publication-wacher');
const UserWatcher = require('./user-watcher');
const FileWatcher = require('./file-watcher');
const CommentWatcher = require('./comment-watcher');

class Builder {
    constructor(parameters) {
        this.watch_list = [
            new PublicationWatcher(parameters),
// TODO: advance UserWatcher to admin-like user monitoring.
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