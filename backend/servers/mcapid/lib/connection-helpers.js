const status = require('http-status');

const failAuth = (connection) => {
    if (connection.type === 'web') {
        connection.setStatusCode(status.UNAUTHORIZED);
    }
    throw new Error('Not authorized');
};

const setStatusCode = (connection, statusCode) => {
    if (connection.type === 'web') {
        connection.setStatusCode(statusCode);
    }
};

module.exports = {
    failAuth,
    setStatusCode,
};