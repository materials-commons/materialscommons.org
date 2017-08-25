GenericWatcher = require('./GenericWatcher.js');

class UserWatcher extends GenericWatcher{
    constructor() {
        super();
        this.table_name = 'users';
    }
}

module.exports = UserWatcher;