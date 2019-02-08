const r = require('../r');
const _ = require('lodash');
const getSingle = require('./get-single');
const model = require('../../../shared/model');

// getUsers returns all the users in the database. Internal use only
function* getUsers() {
    return r.table('users');
}

// getAllUsersExternal returns all the users in the database; cleaned for external only
function* getAllUsersExternal() {
    return yield r.table('users').without('admin', 'isTemplateAdmin', 'apikey', 'password');
}

// getAllUsersExternal returns the user; cleaned for external only
function* getUserExternal(id) {
    return yield r.table('users').get(id)
        .without('admin', 'isTemplateAdmin', 'apikey', 'password',
            'demo_installed', 'birthtime', 'last_login', 'mtime', 'preferences');
}

// getUser gets the user by index. If no index is given then it
// uses the primary key.
function* getUser(id, index) {
    if (index) {
        let matches = yield r.table('users').getAll(id, {index: index}).run();
        if (matches.length !== 0) {
            return matches[0];
        }
        return null;
    }
    return yield r.table('users').get(id).run();
}

function* updateProjectFavorites(userID, projectID, attrs) {
    if (attrs.favorites) {
        // TODO: validate the projectID exists
        let user = yield r.table('users').get(userID);
        if (!user.favorites) {
            user.favorites = {};
        }

        if (!(projectID in user.favorites)) {
            user.favorites[projectID] = {
                processes: []
            };
        }

        let toAdd = attrs.favorites.processes.filter(p => p.command === 'add').map(p => p.name);
        let toDelete = attrs.favorites.processes.filter(p => p.command === 'delete').map(p => p.name);
        let projProcesses = user.favorites[projectID].processes;
        // remove deleted process favorites
        projProcesses = projProcesses.filter(p => _.findIndex(toDelete, name => name == p, null) === -1);
        let toAddFavs = _.difference(toAdd, projProcesses);
        user.favorites[projectID].processes = projProcesses.concat(toAddFavs);
        yield r.table('users').get(userID).update({favorites: user.favorites});
    }
    return yield r.table('users').get(userID).without('admin', 'apikey', 'password');
}

function* updateUserSettings(userId, settings) {
    yield r.table('users').get(userId).update(settings);
    let user = yield r.table('users').get(userId).without('admin', 'apikey', 'password');
    return {val: user};
}

function* createPasswordResetRequest(user) {
    let validate_uuid = yield r.uuid();
    return yield setUserPasswordResetFlag(user.id, validate_uuid);
}

function* setUserPasswordResetFlag(userId, validate_uuid) {
    return yield r.table('users').get(userId).update({reset_password: true, validate_uuid: validate_uuid});
}

function* clearUserPasswordResetFlag(userId) {
    return yield r.table('users').get(userId).replace(r.row.without('reset_password', 'validate_uuid'));
}

function* getUserForPasswordResetFromUuid(uuid) {
    let results = yield r.table('users')
        .getAll(uuid, {index: 'validate_uuid'}).without('apikey', 'password');
    if (!results.length) {
        return {error: 'No validated user record. Please retry.'};
    }
    let user = results[0];
    return {val: user};
}

function* createUnverifiedAccount(account) {
    let apikey = yield r.uuid(),
        user = new model.User(account.email, account.fullname, apikey.replace(/-/g, ''));
    user.validate_uuid = yield r.uuid();
    let u = yield r.table('users').get(account.email);
    if (u) {
        return {error: 'User account already exists: ' + account.email};
    }
    let rv = yield r.table('account_requests').insert(user, {returnChanges: true});
    if (rv.errors) {
        return {error: 'User account already exists: ' + account.email};
    }

    return {val: rv.changes[0].new_val};
}

function* getUserRegistrationFromUuid(uuid) {
    let results = yield r.table('account_requests').getAll(uuid, {index: 'validate_uuid'});
    if (!results.length) {
        return {error: 'User validation record does not exists: ' + uuid};
    }
    let registration = results[0];
    delete registration['password'];
    delete registration['apikey'];
    return {val: registration};
}

module.exports = {
    getUsers: getUsers,
    getAllUsersExternal,
    getUserExternal,
    getUser: getUser,
    get: function(id, index) {
        return getSingle(r, 'users', id, index);
    },
    updateProjectFavorites,
    updateUserSettings,
    createUnverifiedAccount,
    createPasswordResetRequest,
    getUserRegistrationFromUuid,
    setUserPasswordResetFlag,
    clearUserPasswordResetFlag,
    getUserForPasswordResetFromUuid
};