PublicationWatcher = require('./PublicationWacher')
UserWatcher = require('./UserWatcher')

class Builder {
    constructor() {
        this.watch_list = [
            new PublicationWatcher(),
            new UserWatcher()
        ]
    }

    get_watch_list() {
        return this.watch_list;
    }

}

module.exports = Builder;