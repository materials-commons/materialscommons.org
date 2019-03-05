const {spawnSync} = require('child_process');
const bcrypt = require('bcrypt');
const _ = require('lodash');

module.exports = function(r) {
    // getUsers returns all the users in the database. Internal use only.
    async function getUsers() {
        return r.table('users');
    }

    async function getUsersSummary() {
        return await r.table('users').pluck('id', 'fullname');
    }

    async function resetApikey(userId) {
        let newAPIKey = await r.uuid();
        await r.table('users').get(userId).update({'apikey': newAPIKey});
        return newAPIKey;
    }

    const rounds = 10;

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

        let hashedPw = await bcrypt.hash(userPassword, rounds);
        await r.table('users').get(userId).update({converted: true, password: hashedPw});

        return true;
    }

    return {
        getUsers: getUsers,
        getUsersSummary,
        resetApikey,
        loginUserReturningToken,
    };
};