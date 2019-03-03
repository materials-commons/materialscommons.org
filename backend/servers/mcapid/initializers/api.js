const {Initializer, api} = require('actionhero');

module.exports = class ApiInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'api-initializer';
    }

    initialize() {
        const r = require('rethinkdbdash')({db: api.config.db.name, port: api.config.db.port});
        api.mc = {
            r: r,
            directories: require('@dal/directories')(r),
            projects: require('@dal/projects')(r),
            datasets: require('@dal/datasets')(r),
            check: require('@dal/check')(r),
            processes: require('@dal/processes')(r),
            publishedDatasets: require('@dal/published-datasets')(r),
            samples: require('@dal/samples')(r),
            templates: require('@dal/templates')(r),
            files: require('@dal/files')(r),
            log: {
                debug: (msg, params) => api.log(msg, 'debug', params),
                info: (msg, params) => api.log(msg, 'info', params),
                notice: (msg, params) => api.log(msg, 'notice', params),
                warning: (msg, params) => api.log(msg, 'warning', params),
                error: (msg, params) => api.log(msg, 'error', params),
                critical: (msg, params) => api.log(msg, 'crit', params),
                alert: (msg, params) => api.log(msg, 'alert', params),
                emergency: (msg, params) => api.log(msg, 'emerg', params),
            }
        };
    }
};