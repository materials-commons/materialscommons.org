const {Action} = require('actionhero');

module.exports = class ListSamplesAction extends Action {
    constructor() {
        super();
        this.name = 'listSamples';
        this.description = 'List samples for user';
    }

    async run({response, params}) {

    }
};

module.exports = class CreateSampleAction extends Action {
    constructor() {
        super();
        this.name = 'createSample';
        this.description = 'Creates a new sample';
    }

    async run({response, params}) {

    }
};

module.exports = class GetSampleAction extends Action {
    constructor() {
        super();
        this.name = 'getSample';
        this.description = 'Gets sample details';
    }

    async run({response, params}) {

    }
};

module.exports = class UpdateSampleAction extends Action {
    constructor() {
        super();
        this.name = 'updateSample';
        this.description = 'Updates sample';
    }

    async run({response, params}) {

    }
};

module.exports = class DeleteSampleAction extends Action {
    constructor() {
        super();
        this.name = 'deleteSample';
        this.description = 'Delete sample';
    }

    async run({response, params}) {

    }
};

module.exports = class CloneSampleAction extends Action {
    constructor() {
        super();
        this.name = 'cloneSample';
        this.description = 'Clone sample';
    }

    async run({response, params}) {

    }
};

module.exports = class GetSampleFilesAction extends Action {
    constructor() {
        super();
        this.name = 'getSampleFiles';
        this.description = 'Get files for sample';
    }

    async run({response, params}) {

    }
};