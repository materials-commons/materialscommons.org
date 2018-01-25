const {Initializer, api} = require('actionhero');
const apikeyCache = require('../lib/apikey-cache');

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
                    throw new Error('Not authorized');
                }

                let user = await apikeyCache.find(data.params.apikey);
                if (!user) {
                    throw new Error('Not authorized');
                }

                data.user = user;
            }
        };
        api.actions.addMiddleware(middleware)
    }
};