const {Initializer, api} = require('actionhero');

module.exports = class APIKeyInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'zapikey';
        this.startPriority = 50;
    }

    initialize() {
        // *************************************************************************************************
        //     require('../lib/apikey-cache') in initialize so that rethinkdb initializer has run before the require
        //     statement, otherwise rethinkdb in r is not defined.
        // *************************************************************************************************
        const apikeyCache = require('../lib/apikey-cache');
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
                if (! user) {
                    throw new Error('Not authorized');
                }

                data.user = user;
            }
        };
         api.actions.addMiddleware(middleware)
    }
};