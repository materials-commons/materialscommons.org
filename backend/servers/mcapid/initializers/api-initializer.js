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
        const inspect = (data) => (data ? {data: util.inspect(data, {showHidden: false, depth: null, breakLength: Infinity})} : null);
        api.mc = {
            r: r,

            access: require('@dal/access')(r),
            check: require('@dal/check')(r),
            datasets: require('@dal/datasets')(r),
            directories: require('@dal/directories')(r),
            experiments: require('@dal/experiments')(r),
            files: require('@dal/files')(r),
            processes: require('@dal/processes')(r),
            projects: require('@dal/projects')(r),
            properties: require('@dal/properties')(r),
            publishedDatasets: require('@dal/published-datasets')(r),
            samples: require('@dal/samples')(r),
            templates: require('@dal/templates')(r),
            users: require('@dal/users')(r),

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