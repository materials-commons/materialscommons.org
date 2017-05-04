const r = require('../r');
const request = require('request-promise');

let doiUrl = "https://ezid.lib.purdue.edu/";
let doiTestNamespace = "doi:10.5072/FK2"; // - only test ID's for now!
let doiTestUser = process.env.DOITESTUSER;
let doiTestPW = process.env.DOITESTPW;
let doiNamespace = process.env.DOINAMESPACE;
let doiUser = process.env.DOIUSER;
let doiPW = process.env.DOIPW;
let doiPublisher = process.env.DOIPUBLISHER || "Materials Commons";

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

function* doiCreate(datasetId, title, author, date, otherArgs) {
    let namespace = doiNamespace;
    let user = doiUser;
    let pw = doiPW;

    if (otherArgs && otherArgs.test) {
        namespace = doiTestNamespace;
        user = doiTestUser;
        pw = doiTestPW;
        delete otherArgs['test'];
    }
    let createCall = "id/" + namespace;
    let url = doiUrl + createCall;
    let options = {
        method: 'PUT',
        header: {
            "Content-Type": "text/plain; charset=UTF-8"
        },
        form: {
            who: author,
            what: title,
            when: date,
            publisher: doiPublisher
        },
        auth: {
            user: user,
            pass: pw
        },
        uri: url,
        resolveWithFullResponse: true
    };
    if (otherArgs) {
        for (let key in otherArgs) {
            options.form[key] = otherArgs.key;
        }
    }
    console.log("url: ", url);
    console.log("making request: ",options);
    return response = yield request(options);
}

module.exports = {
    doiServerStatusIsOK,
    doiCreate
};