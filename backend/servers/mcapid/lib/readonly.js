const apikeysAllowedToWrite = {
    'abc': true,
};

function isReadonly(user) {
    return (!(user.apikey in apikeysAllowedToWrite));
}

module.exports = {
    isReadonly,
};