const {Initializer, api} = require('actionhero');
const r = require('../../shared/r');

module.exports = class ApiInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'api-initializer';
    }

    initialize() {
        api.directories = require('../lib/dal/directories')(r);
        api.projects = require('../lib/dal/projects')(r);
        api.datasets = require('../lib/dal/datasets')(r);
        api.check = require('../lib/dal/check')(r);
        api.processes = require('../lib/dal/processes')(r);
        api.publishedDatasets = require('../lib/dal/published-datasets')(r);
        api.samples = require('../lib/dal/samples')(r);
        api.templates = require('../lib/dal/templates')(r);
    }
};