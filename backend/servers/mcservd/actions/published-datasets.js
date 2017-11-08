const {Action} = require('actionhero');
const datasets = require('../model/datasets');

module.exports.AllPublishedDatasetsAction = class AllPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'allPublishedDatasets';
        this.do_not_authenticate = true;
        this.description = 'Returns all datasets that have been published';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        response.val = await datasets.getAll();
    }
};

module.exports.TopViewedPublishedDatasetsAction = class TopViewedPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'topViewedPublishedDatasets';
        this.description = 'Returns the most viewed datasets';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        response.val = await datasets.getTopViews();
    }
};

module.exports.RecentlyPublishedDatasetsAction = class RecentlyPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'recentlyPublishedDatasets';
        this.description = 'Returns most recently published datasets';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        response.val = await datasets.getRecent();
    }
};

module.exports.GetPublishedDatasetAction = class GetPublishedDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'getPublishedDataset';
        this.description = 'Returns the published dataset';
        this.do_not_authenticate = true;
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