const {Initializer, api} = require('actionhero');
const apikeyCache = require('../lib/apikey-cache');
const r = require('../../shared/r');
const {failAuth} = require('../lib/connection-helpers');

module.exports = class APIKeyInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'apikey';
        this.startPriority = 1000;
    }

    initialize() {
        const middleware = {
            name: this.name,
            global: true,
            preProcessor: async (data) => {
                if (data.actionTemplate.do_not_authenticate) {
                    return;
                }

                if (!data.params.apikey) {
                    failAuth(data.connection);
                }

                let user = await apikeyCache.find(data.params.apikey);
                if (!user) {
                    failAuth(data.connection);
                }

                data.user = user;
            }
        };

        r.table('users').changes().toStream().on('data', () => apikeyCache.clear());

        api.actions.addMiddleware(middleware);
    }
};