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
    let description = null;

    if (otherArgs && otherArgs.test) {
        namespace = doiTestNamespace;
        user = doiTestUser;
        pw = doiTestPassword;
        delete otherArgs['test'];
    }
    if (otherArgs && otherArgs.description) {
        description = otherArgs.description;
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

    if (description) {
        body = "datasite.description:" + description + "\n" + body;
    }

    let options = {
        method: 'POST', // POST = Mint operation
        body: body,
        uri: url,
        auth: {
            user: user,
            pass: pw,
            sendImmediately: false
        },
        headers: {'Content-Type': 'text/plain'}
    };

    let doi = null;
    try {
        console.log("just before request");
        let response = yield request(options);
        console.log("just after request");
        let matches = response.match(/doi:\S*/i);
        doi = matches[0];
    } catch (e) {
        console.log("request error: ",e.message);
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

    let results = yield datasets.getDataset(datasetId);

    console.log(results);

    return results;
}

function* doiGetMetadata(doi) {
    let link = doiUrlLink(doi);

    // console.log("link: ", link);

    let options = {
        method: 'GET',
        uri: link,
        headers: {'Content-Type': 'text/plain'}
    };

    return yield request(options);
}

function doiUrlLink(doi) {
    return `${doiUrl}id/${doi}`;
}

module.exports = {
    doiServerStatusIsOK,
    doiMint,
    doiGetMetadata,
    doiUrlLink
};