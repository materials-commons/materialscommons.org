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
    console.log(response.body);
    return ((response.statusCode == "200")
        && (response.body == "success: EZID is up"));
}

function* doiMint(datasetId, title, author, date, otherArgs) {
    let namespace = doiNamespace;
    let user = doiUser;
    let pw = doiPW;

    if (otherArgs && otherArgs.test) {
        namespace = doiTestNamespace;
        user = doiTestUser;
        pw = doiTestPW;
        delete otherArgs['test'];
    }

    console.log('DOI: namespace = ',namespace);
    console.log('DOI: user = ',user);
    console.log('DOI: pw = ',pw);

    let createCall = "shoulder/" + namespace;
    let url = doiUrl + createCall;
    let body = "datasite.creator: " + author + "\n"
            + "datasite.title: " + title + "\n"
            + "datasite.publicationdate: " + date + "\n"
            + "datasite.publisher: " + doiPublisher;

    let options = {
        method: 'POST', // POST = Mint operation
        body: body,
        uri: url,
        auth : {
            user : 'apitest',
            pass : 'apitest',
            sendImmediately : false
        },
        headers: { 'Content-Type': 'text/plain'}
    };

    console.log("DOI url: ", url);
    console.log("DOI request: ",options);
    console.log("DOI body");
    console.log(body);
    let response = null;
    try {
        response = yield request(options);
    } catch (e) {
        response = e;
    }
    console.log(response);
    return response;
}

module.exports = {
    doiServerStatusIsOK,
    doiMint
};