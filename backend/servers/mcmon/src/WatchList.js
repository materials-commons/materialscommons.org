const PublicationWatcher = require('./PublicationWacher');
const UserWatcher = require('./UserWatcher');
const FileWatcher = require('./FileWatcher');

class Builder {
    constructor() {
        this.watch_list = [
            new PublicationWatcher(),
            new UserWatcher(),
            new FileWatcher()
        ]
    }

    get_watch_list() {
        return this.watch_list;
    }

}

module.exports = Builder;