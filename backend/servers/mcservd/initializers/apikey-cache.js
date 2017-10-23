const {Initializer, api} = require('actionhero');

module.exports = class APIKeyCacheInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'apikeyCache';
        this.loadPriority = 100;
        this.startPriority = 100;
        this.stopPriority = 100;
    }
    async initialize() {

    }
};