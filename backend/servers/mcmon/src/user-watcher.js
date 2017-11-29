const GenericWatcher = require('./generic-watcher.js');

// TODO: expand this usage to logging user activity. Possibly by watching multiple tables.

class UserWatcher extends GenericWatcher {
    constructor(parameters) {
        super(parameters);
        this.table_name = 'users';
    }

    action(delta) {
        let user = delta.new_val;
        console.log("User logged in:", user.fullname, "-", user.email);
    }
}

module.exports = UserWatcher;