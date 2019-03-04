const {Initializer, api} = require('actionhero');
const {failAuth} = require('@lib/connection-helpers');

module.exports = class APIKeyInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'apikey';
        this.startPriority = 1100;
        this.loadPriority = 1100;
    }

    initialize() {
        const apikeyCache = require('@lib/apikey-cache')(api.mc.users);
        let r = api.mc.r;

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