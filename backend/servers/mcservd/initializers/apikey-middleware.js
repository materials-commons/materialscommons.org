const {Initializer, api} = require('actionhero')

module.exports.ApikeyMiddleware = class ApikeyMiddleware extends Initializer {
    constructor() {
        super();
        this.name = 'apikeyMiddleware';
    }

    async initialize() {
        const middleware = {
            name: this.name,
            global: true,
            preprocessor: async (data) => {
                if (data.actionTemplate.do_not_authenticate) {
                    return;
                }
                try {
                    data.user = await api.cache.load(data.params.apikey);
                } catch (e) {
                    throw new Error("No access");
                }
            }
        };

        api.actions.addMiddleware(middleware);
    }
}