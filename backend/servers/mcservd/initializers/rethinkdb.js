const {Initializer, api} = require('actionhero');
const rethinkdbdash = require('rethinkdbdash');


module.exports = class RethindbDashInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'rethinkdbdash';
        this.loadPriority = 100;
        this.startPriority = 100;
        this.stopPriority = 100;
    }

    async initialize() {
        let ropts = {
            db: 'materialscommons',
            port: process.env.MCDB_PORT || 30815
        };

        api.r = rethinkdbdash(ropts);
    }
};
