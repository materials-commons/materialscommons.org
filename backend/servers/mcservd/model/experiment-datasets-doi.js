const r = require('../r');
const request = require('request-promise');

const datasets = require('./experiment-datasets');

let doiUrl = process.env.MC_DOI_SERVICE_URL || 'https://ezid.lib.purdue.edu/';
let doiPublisher = process.env.MC_DOI_PUBLISHER || "Materials Commons";
let publicationURLBase = process.env.MC_DOI_PUBLICATION_BASE;

let doiNamespace = process.env.MC_DOI_NAMESPACE;
let doiUser = process.env.MC_DOI_USER;
let doiPassword = process.env.MC_DOI_PW;


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

    if (otherArgs && otherArgs.description) {
        description = otherArgs.description;
    }

    let publisher = doiPublisher;
    let targetUrl = publicationURLBase + "/" + datasetId;
    let createCall = "shoulder/" + namespace;
    let url = doiUrl + createCall;
    let body = "_target: " + targetUrl + "\n"
        + "datacite.creator: " + creator + "\n"
        + "datacite.title: " + title + "\n"
        + "datacite.publisher: " + publisher + "\n"
        + "datacite.publicationyear: " + publicationYear + "\n"
        + "datacite.resourcetype: Dataset";

    if (description) {
        body = "datacite.description:" + description + "\n" + body;
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

function* doiGetMetadata(datasetId) {
    let dataset = yield datasets.getDataset(datasetId);
    let doi = dataset.val.doi;

    let link = doiUrlLink(doi);

    let options = {
        method: 'GET',
        uri: link,
        headers: {'Content-Type': 'text/plain'}
    };

    let response = null;
    try {
        response = yield request(options);
    } catch (e) {
        return {
            error: e
        };
    }

    let matches = response.match(/doi:\S*/i);
    if (doi != matches[0]) {
        return {error: "Matadata not available for doi: " + doi};
    }

    return parseNameValueList(response);

}

function* doiGetServerLink(datasetId) {
    let dataset = yield datasets.getDataset(datasetId);
    let doi = dataset.val.doi;
    return doiUrlLink(doi);
}

function doiUrlLink(doi) {
    return `${doiUrl}id/${doi}`;
}

function parseNameValueList(linesInAString) {
    let ret = {};
    let lines = linesInAString.split('\n');
    for (let line of lines) {
        line = line.trim();
        let index = line.indexOf(':');
        if (index > -1) {
            let key = line.substr(0, index).trim();
            ret[key] = line.substr(index + 1).trim();
        }
    }
    return ret;
}

module.exports = {
    doiServerStatusIsOK,
    doiMint,
    doiGetMetadata,
    doiGetServerLink
};