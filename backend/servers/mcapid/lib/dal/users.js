const {spawnSync} = require('child_process');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const model = require('@lib/model');

module.exports = function(r) {

    const db = require('./db')(r);

    // getUsers returns all the users in the database. Internal use only.
    async function getUsers() {
        return r.table('users');
    }

    async function getUsersSummary() {
        return await r.table('users').pluck('id', 'fullname');
    }

    async function resetApikey(userId) {
        let newAPIKey = await r.uuid();
        newAPIKey = newAPIKey.replace(/-/g, '');
        await r.table('users').get(userId).update({'apikey': newAPIKey});
        return {apikey: newAPIKey};
    }

    const PASSWORD_HASH_ROUNDS = 10;

    async function loginUserReturningToken(userId, userPassword) {
        let u = await r.table('users').get(userId);
        if (!u.converted) {
            if (!await checkAndConvertUser(userId, userPassword)) {
                return null;
            }
        } else {
            if (!await bcrypt.compare(userPassword, u.password)) {
                return null;
            }
        }

        return _.omit(u, ['password', 'converted']);
    }

    async function checkAndConvertUser(userId, userPassword) {
        let rv = spawnSync('../../scripts/validate_pw.py', ['--email', userId, '--password', userPassword, '--port', process.env.MCDB_PORT]);
        if (rv.status !== 0) {
            return false;
        }

        let hashedPw = await bcrypt.hash(userPassword, PASSWORD_HASH_ROUNDS);
        await r.table('users').get(userId).update({converted: true, password: hashedPw});

        return true;
    }

    async function createNewUser(email, name, password) {
        let apikey = await r.uuid(),
            user = new model.User(email, name, apikey.replace(/-/g, ''));
        user.password = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
        let u = await db.insert('users', user);
        return _.omit(u, ['password']);
    }

    async function changeUserPassword(userId, password) {
        let hashed = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
        await r.table('users').get(userId).update({password: hashed});
        return true;
    }

    async function resetUserPasswordFromUuid(password, validate_uuid) {
        let u = await r.table('users').getAll(validate_uuid, {index: 'validate_uuid'}).nth(0);
        let hashed = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
        await r.table('users').get(u.id).update({password: hashed});
        await r.table('users').get(u.id).replace(r.row.without('reset_password', 'validate_uuid'));
        return true;
    }

    return {
        getUsers: getUsers,
        getUsersSummary,
        resetApikey,
        loginUserReturningToken,
        createNewUser,
        changeUserPassword,
        resetUserPasswordFromUuid,
    };
};