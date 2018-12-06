const r = require('../r');
const request = require('request-promise');

const datasets = require('./experiment-datasets');

let doiServiceURL = process.env.MC_DOI_SERVICE_URL;
let doiUserInterfaceURL = process.env.MC_DOI_USER_INTERFACE_URL;
let doiPublisher = process.env.MC_DOI_PUBLISHER;
let publicationURLBase = process.env.MC_DOI_PUBLICATION_BASE;

let doiNamespace = process.env.MC_DOI_NAMESPACE;
let doiUser = process.env.MC_DOI_USER;
let doiPassword = process.env.MC_DOI_PW;


function* doiServerStatusIsOK() {
    checkEnvValues();
    let url = doiServiceURL + "status";
    let options = {
        method: 'GET',
        uri: url,
        resolveWithFullResponse: true
    };
    let response = yield request(options);
    return ((response.statusCode === "200")
    && (response.body === "success: API is up"));
}

function* doiMint(datasetId, title, creator, publicationYear, otherArgs) {
    checkEnvValues();
    let namespace = doiNamespace;
    let user = doiUser;
    let pw = doiPassword;
    let description = null;

    if (otherArgs && otherArgs.description) {
        description = otherArgs.description;
    }

    let publisher = doiPublisher;
    let targetUrl = publicationURLBase + datasetId;
    let createCall = "shoulder/" + namespace;
    let url = doiServiceURL + createCall;
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
    if (status.replaced !== 1) {
        return {
            error: `Update of DOI in dataset, ${datasetId}, failed.`
        };
    }

    return yield datasets.getDataset(datasetId);
}

function* doiGetMetadata(datasetId) {
    checkEnvValues();
    let dataset = yield datasets.getDataset(datasetId);
    let doi = dataset.val.doi;

    let link = `${doiServiceURL}id/${doi}`;

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
    if (doi !== matches[0]) {
        return {error: "Matadata not available for doi: " + doi};
    }

    return parseNameValueList(response);

}

function* doiGetUserInterfaceLink(datasetId) {
    checkEnvValues();
    let dataset = yield datasets.getDataset(datasetId);
    let doi = dataset.val.doi;
    return doiUILink(doi);
}

function doiUILink(doi) {
    // let retValue = `${doiUserInterfaceURL}clients/${doiUser.toLowerCase()}/dois/`;
    // retValue += doi.substring("doi:".length);
    let retValue = doiUserInterfaceURL + doi.substring("doi:".length);
    return retValue;
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

function checkEnvValues() {
    // check for all env variables for DOI functions
    let expectedEnvValues = {
        'MC_DOI_PUBLISHER':          process.env.MC_DOI_PUBLISHER,
        'MC_DOI_NAMESPACE':          process.env.MC_DOI_NAMESPACE,
        'MC_DOI_USER':               process.env.MC_DOI_USER,
        'MC_DOI_PW':                 process.env.MC_DOI_PW,
        'MC_DOI_PUBLICATION_BASE':   process.env.MC_DOI_PUBLICATION_BASE,
        'MC_DOI_SERVICE_URL':        process.env.MC_DOI_SERVICE_URL,
        'MC_DOI_USER_INTERFACE_URL': process.env.MC_DOI_USER_INTERFACE_URL
    };

    let keys = Object.keys(expectedEnvValues);

    let missingValueKeys = [];

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = expectedEnvValues[key];
        if (!value) {
            missingValueKeys.append(key)
        }
    }
    if (missingValueKeys.len > 0) {
        let message = "In DOI service, missing one or more env values: " +
            missingValueKeys.join(', ');
        throw Error(message);
    }
}

module.exports = {
    doiServerStatusIsOK,
    doiMint,
    doiGetMetadata,
    doiGetUserInterfaceLink,
};