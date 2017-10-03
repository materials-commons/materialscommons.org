const PublicationWatcher = require('./PublicationWacher');
const UserWatcher = require('./UserWatcher');
const FileWatcher = require('./FileWatcher');

class Builder {
    constructor(parameters) {
        this.watch_list = [
            new PublicationWatcher(parameters),
// TODO: advnace User Watcher to admin-like user monitoring.
//            new UserWatcher(parameters),
            new FileWatcher(parameters)
        ]
    }

    get_watch_list() {
        return this.watch_list;
    }

}

module.exports = Builder;