const r = require('../r');
const request = require('request-promise');

const datasets = require('./experiment-datasets');

let doiUrl = process.env.DOISERVICEURL || 'https://ezid.lib.purdue.edu/';
let doiPublisher = process.env.DOIPUBLISHER || "Materials Commons";
let publicationURLBase = process.env.DOIPUBLICATIONBASE;

let doiNamespace = process.env.DOINAMESPACE;
let doiUser = process.env.DOIUSER;
let doiPassword = process.env.DOIPW;

// for testing
let doiTestNamespace = process.env.DOITESTNAMESPACE;
let doiTestUser = process.env.DOITESTUSER;
let doiTestPassword = process.env.DOITESTPW;

function* doiServerStatusIsOK() {
    let url = doiUrl + "status";
    let options = {
        method: 'GET',
        uri: url,
        resolveWithFullResponse: true
    };
    let response = yield request(options);
    return ((response.statusCode == "200")
        && (response.body == "success: EZID is up"));
}

function* doiMint(datasetId, title, creator, publicationYear, otherArgs) {
    let namespace = doiNamespace;
    let user = doiUser;
    let pw = doiPassword;

    if (otherArgs && otherArgs.test) {
        namespace = doiTestNamespace;
        user = doiTestUser;
        pw = doiTestPassword;
        delete otherArgs['test'];
    }

    let publisher = doiPublisher;
    let targetUrl = publicationURLBase + "#/details/" + datasetId;
    let createCall = "shoulder/" + namespace;
    let url = doiUrl + createCall;
    let body = "_target: " + targetUrl + "\n"
        + "datacite.creator: " + creator + "\n"
        + "datacite.title: " + title + "\n"
        + "datacite.publisher: " + publisher + "\n"
        + "datacite.publicationyear: " + publicationYear + "\n"
        + "datacite.resourcetype: Dataset";

    let options = {
        method: 'POST', // POST = Mint operation
        body: body,
        uri: url,
        auth : {
            user: user,
            pass: pw,
            sendImmediately : false
        },
        headers: { 'Content-Type': 'text/plain'}
    };

    let doi = null;
    try {
        let response = yield request(options);
        let matches = response.match(/doi:\S*/i);
        doi = matches[0];
    } catch (e) {
        return {
            error: e
        };
    }

    let status = yield r.table('datasets').get(datasetId).update({doi: doi});
    if (status.replaced != 1) {
        return {
            error: `Update of DOI in dataset, ${datasetId}, failed.`
        };
    }

    return yield datasets.getDataset(datasetId);
}

function doiUrlLink(doi) {
    return `${doiUrl}/id/${doi}`;
}

module.exports = {
    doiServerStatusIsOK,
    doiMint,
    doiUrlLink
};