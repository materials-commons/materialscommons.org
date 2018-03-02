const r = require('../../../shared/r');
const _ = require('lodash');
const getSingle = require('./get-single');
const model = require('../../../shared/model');

// getUsers returns all the users in the database. Internal use only
async function getUsers() {
    return r.table('users');
}

// getAllUsersExternal returns all the users in the database; cleaned for external only
async function getAllUsersExternal() {
    return await r.table('users').without('admin', 'isTemplateAdmin', 'apikey', 'password');
}

// getAllUsersExternal returns the user; cleaned for external only
async function getUserExternal(id) {
    return await r.table('users').get(id).without('admin', 'isTemplateAdmin', 'apikey', 'password');
}

// getUser gets the user by index. If no index is given then it
// uses the primary key.
async function getUser(id, index) {
    if (index) {
        let matches = await r.table('users').getAll(id, {index: index}).run();
        if (matches.length !== 0) {
            return matches[0];
        }
        return null;
    }
    return await r.table('users').get(id).run();
}

async function updateProjectFavorites(userID, projectID, attrs) {
    if (attrs.favorites) {
        // TODO: validate the projectID exists
        let user = await r.table('users').get(userID);
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
        await r.table('users').get(userID).update({favorites: user.favorites});
    }
    return await r.table('users').get(userID).without('admin', 'apikey', 'password');
}

async function updateUserSettings(userId, settings) {
    await r.table('users').get(userId).update(settings);
    let user = await r.table('users').get(userId).without('admin', 'apikey', 'password');
    return {val: user};
}

async function createPasswordResetRequest(user) {
    let validate_uuid = await r.uuid();
    return await setUserPasswordResetFlag(user.id, validate_uuid);
}

async function setUserPasswordResetFlag(userId, validate_uuid) {
    return await r.table('users').get(userId).update({reset_password: true, validate_uuid: validate_uuid});
}

async function clearUserPasswordResetFlag(userId) {
    return await r.table('users').get(userId).replace(r.row.without('reset_password', 'validate_uuid'));
}

async function getUserForPasswordResetFromUuid(uuid) {
    let results = await r.table('users')
        .getAll(uuid, {index: 'validate_uuid'}).without('apikey', 'password');
    if (!results.length) {
        return {error: "No validated user record. Please retry."};
    }
    let user = results[0];
    return {val: user};
}

async function createUnverifiedAccount(account) {
    let apikey = await r.uuid(),
        user = new model.User(account.email, account.fullname, apikey.replace(/-/g, ''));
    user.validate_uuid = await r.uuid();
    let u = await r.table('users').get(account.email);
    if (u) {
        return {error: "User account already exists: " + account.email};
    }
    let rv = await r.table('account_requests').insert(user, {returnChanges: true});
    if (rv.errors) {
        return {error: "Validation was already sent: " + account.email};
    }

    return {val: rv.changes[0].new_val};
}

async function getUserRegistrationFromUuid(uuid) {
    let results = await r.table('account_requests').getAll(uuid, {index: 'validate_uuid'});
    if (!results.length) {
        return {error: "User validation record does not exists: " + uuid};
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
    get: function (id, index) {
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