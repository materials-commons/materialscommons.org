const {Initializer, api} = require('actionhero');
const r = require('../../shared/r');

module.exports = class ApiInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'api-initializer';
    }

    initialize() {
        api.mc = {
            directories: require('../lib/dal/directories')(r),
            projects: require('../lib/dal/projects')(r),
            datasets: require('../lib/dal/datasets')(r),
            check: require('../lib/dal/check')(r),
            processes: require('../lib/dal/processes')(r),
            publishedDatasets: require('../lib/dal/published-datasets')(r),
            samples: require('../lib/dal/samples')(r),
            templates: require('../lib/dal/templates')(r),
            files: require('../lib/dal/files')(r),
        };
    }
};