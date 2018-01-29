const {api} = require('actionhero');

module.exports.tryCatch = async function (fn) {
    try {
        return await fn();
    } catch (error) {
        api.log('Failed API Call', error);
        return null;
    }
};