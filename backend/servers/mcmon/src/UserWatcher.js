const GenericWatcher = require('./GenericWatcher.js');

class UserWatcher extends GenericWatcher{
    constructor() {
        super();
        this.table_name = 'users';
    }

    action(delta) {
        let user = delta.new_val;
        console.log("User logged in:", user.fullname, "-", user.email);
    }
}

module.exports = UserWatcher;