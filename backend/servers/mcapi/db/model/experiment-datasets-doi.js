const r = require('../r');
const request = require('request-promise');

let doiUrl = "https://ezid.lib.purdue.edu/";

function* doiServerStatusIsOK() {
    let url = doiUrl + "status";
    let options = {
        method: 'GET',
        uri: url,
        resolveWithFullResponse: true
    };
    let response = yield request(options);
    return ((response.statusCode === "200")
        && (response.body === "success: EZID is up"));
}

module.exports = {
    doiServerStatusIsOK
};