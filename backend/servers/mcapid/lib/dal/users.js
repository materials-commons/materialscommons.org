module.exports = function (r) {
// getUsers returns all the users in the database. Internal use only
    async function getUsers() {
        return r.table('users');
    }

    return {
        getUsers: getUsers,
    };
};