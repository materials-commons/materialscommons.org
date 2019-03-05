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

    return {
        getUsers: getUsers,
        getUsersSummary,
        resetApikey,
    };
};