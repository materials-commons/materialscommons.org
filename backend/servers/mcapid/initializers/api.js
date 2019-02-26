const {Initializer, api} = require('actionhero');
const r = require('@lib/r');

module.exports = class ApiInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'api-initializer';
    }

    initialize() {
        api.mc = {
            directories: require('@dal/directories')(r),
            projects: require('@dal/projects')(r),
            datasets: require('@dal/datasets')(r),
            check: require('@dal/check')(r),
            processes: require('@dal/processes')(r),
            publishedDatasets: require('@dal/published-datasets')(r),
            samples: require('@dal/samples')(r),
            templates: require('@dal/templates')(r),
            files: require('@dal/files')(r),
        };
    }
};