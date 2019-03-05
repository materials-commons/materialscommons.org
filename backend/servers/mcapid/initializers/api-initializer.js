const {Initializer, api} = require('actionhero');
const util = require('util');

module.exports = class ApiInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'api-initializer';
        this.loadPriority = 1000;
    }

    initialize() {
        const r = require('rethinkdbdash')({db: api.config.db.name, port: api.config.db.port});
        const inspect = (data) => (data ? {data: util.inspect(data, {showHidden: false, depth: null})} : null);
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
            users: require('@dal/users')(r),
            access: require('@dal/access')(r),
            log: {
                debug: (msg, data) => api.log(msg, 'debug', inspect(data)),
                info: (msg, data) => api.log(msg, 'info', inspect(data)),
                notice: (msg, data) => api.log(msg, 'notice', inspect(data)),
                warning: (msg, data) => api.log(msg, 'warning', inspect(data)),
                error: (msg, data) => api.log(msg, 'error', inspect(data)),
                crit: (msg, data) => api.log(msg, 'crit', inspect(data)),
                alert: (msg, data) => api.log(msg, 'alert', inspect(data)),
                emerg: (msg, data) => api.log(msg, 'emerg', inspect(data)),
            }
        };
    }
};