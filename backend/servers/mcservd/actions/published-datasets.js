const {Action} = require('actionhero');
const datasets = require('../model/datasets');

module.exports = class AllPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'allPublishedDatasets';
        this.description = 'Returns all datasets that have been published';
    }

    async run({response}) {
        response.val = await datasets.getAll();
    }
};

model.exports = class TopViewedPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'topViewedPublishedDatasets';
        this.description = 'Returns the most viewed datasets';
    }

    async run({response}) {
        response.val = await datasets.getTopViews();
    }
};

model.exports = class RecentlyPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'recentlyPublishedDatasets';
        this.description = 'Returns most recently published datasets';
    }

    async run({response}) {
        response.val = await datasets.getRecent();
    }
};

model.exports = class GetPublishedDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'getPublishedDataset';
        this.description = 'Returns the published dataset';
        this.inputs = {
            dataset_id: {
                required: true
            }
        }
    }

    async run({response, params}) {
        response.val = await datasets.getDataset(params.dataset_id);
    }
};