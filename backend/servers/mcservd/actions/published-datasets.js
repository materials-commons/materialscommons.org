const {Action, api} = require('actionhero');
const datasets = require('../model/datasets');

module.exports = class AllPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'allPublishedDatasets';
        this.description = 'Returns all datasets that have been published';
    }

    async run({response}) {
        response.users = await datasets.getAll();
    }
};

module.exports = class HelloAction extends Action {
    constructor() {
        super();
        this.name = 'hello';
        this.description = 'Return hello';
    }

    async run({response}) {
        response.hello = {msg: 'hello'};
    }
};

module.exports = class Hello2Action extends Action {
    constructor() {
        super();
        this.name = 'hello2';
        this.description = 'Return hello';
    }

    async run({response}) {
        response.hello = {msg: 'hello2'};
    }
};

module.exports = class Hello3Action extends Action {
    constructor() {
        super();
        this.name = 'hello3';
        this.description = 'Return hello';
    }

    async run({response}) {
        response.hello = {msg: 'hello changed'};
    }
};