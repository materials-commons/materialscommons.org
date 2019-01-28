const {Action} = require('actionhero');
const datasets = require('../lib/dal/published-datasets');
const dal = require('../lib/dal');
const get_ip = require('ipware')().get_ip;

module.exports.GetTopViewedPublishedDatasetsAction = class GetTopViewedPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'getTopViewedPublishedDatasets';
        this.description = 'Returns the most viewed datasets';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        const topViewedDatasets = await dal.tryCatch(async() => await datasets.getTopViewedDatasets());
        response.data = topViewedDatasets ? topViewedDatasets : [];
    }
};

module.exports.GetRecentlyPublishedDatasetsAction = class GetRecentlyPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'getRecentlyPublishedDatasets';
        this.description = 'Returns most recently published datasets';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        const recentlyPublishedDatasets = await dal.tryCatch(async() => await datasets.getRecentlyPublishedDatasets());

        response.data = recentlyPublishedDatasets ? recentlyPublishedDatasets : [];
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
        };
    }

    async run({response, params}) {
        const ds = await dal.tryCatch(async() => await datasets.getDataset(params.dataset_id));
        if (!ds) {
            throw new Error(`No such dataset_id ${params.dataset_id}`);
        }
        response.data = ds;
    }
};

module.exports.GetPublishedDatasetsForTagAction = class GetPublishedDatasetsForTagAction extends Action {
    constructor() {
        super();
        this.name = 'getPublishedDatasetsForTag';
        this.description = 'Returns all published datasets associated with the tag';
        this.inputs = {
            tag_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const datasetsForTag = await dal.tryCatch(async() => await datasets.getDatasetsForTag(params.tag_id));
        if (!datasetsForTag) {
            throw new Error(`No datasets for tag ${params.tag_id}`);
        }
        response.data = datasetsForTag;
    }
};

module.exports.GetPublishedDatasetProcessAction = class GetPublishedDatasetProcessAction extends Action {
    constructor() {
        super();
        this.name = 'getPublishedDatasetProcess';
        this.description = 'Returns the process in the published dataset';
        this.do_not_authenticate = true;
        this.inputs = {
            dataset_id: {
                required: true,
            },
            process_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const process = await dal.tryCatch(async() => await datasets.getProcessForDataset(params.dataset_id, params.process_id));
        if (!process) {
            throw new Error(`No such process ${params.process_id} and/or dataset ${params.dataset_id}`);
        }
        response.data = process;
    }
};

module.exports.GetCommentsForPublishedDatasetAction = class GetCommentsForPublishedDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'getCommentsForPublishedDataset';
        this.description = 'Returns the comments for the published dataset';
        this.do_not_authenticate = true;
        this.inputs = {
            dataset_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const comments = await dal.tryCatch(async() => await datasets.getCommentsForDataset(params.dataset_id));
        if (comments == null) {
            throw new Error(`Unknown dataset ${params.dataset_id}`);
        }
        response.data = comments;
    }
};

module.exports.IncrementPublishedDatasetViewsAction = class IncrementPublishedDatasetViewsAction extends Action {
    constructor() {
        super();
        this.name = 'incrementPublishedDatasetViews';
        this.description = 'Increments the published datasets view count';
        this.do_not_authenticate = true;
        this.inputs = {
            dataset_id: {
                required: true,
            },

            user_id: {
                required: false,
            }
        };
    }

    async run({response, params, request}) {
        let userId = params.user_id ? params.user_id : request.remoteIP;
        const view = await dal.tryCatch(async() => await datasets.incrementViewForDataset(params.dataset_id, userId));
        if (!view) {
            throw new Error(`Unable to update dataset ${params.dataset_id} view count`);
        }
        response.data = view;
    }
};

module.exports.UpdatePublishedDatasetUsefulCountAction = class UpdatePublishedDatasetUsefulCountAction extends Action {
    constructor() {
        super();
        this.name = 'updatePublishedDatasetUsefulCount';
        this.description = 'Increments or decrements the useful count for a public dataset';
        this.do_not_authenticate = true;
        this.inputs = {
            dataset_id: {
                required: true,
            },
            user_id: {
                required: true,
            },
            action: {
                required: true,
                validator: (param) => {
                    if (param !== 'add' && param !== 'delete') {
                        throw new Error(`action must be either 'add' or 'delete', ${param} not recognized`);
                    }
                }
            }
        };
    }

    async run({response, params}) {
        let item;

        if (params.action == 'add') {
            item = await dal.tryCatch(async() => datasets.markDatasetAsUseful(params.dataset_id, params.user_id));
        } else {
            // params.action == 'delete'
            item = await dal.tryCatch(async() => datasets.unmarkDatasetAsUseful(params.dataset_id, params.user_id));
        }

        if (!item) {
            throw new Error(`Unable to ${params.action == 'add' ? 'mark' : 'unmark'} dataset ${params.dataset_id} for user ${params.user_id}`);
        }

        response.data = item;
    }
};

module.exports.GetPopularTagsForPublishedDatasetsAction = class GetPopularTagsForPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'getPopularTagsForPublishedDatasets';
        this.description = 'Gets the most popular tags for all published datasets';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        const tags = dal.tryCatch(async() => datasets.getMostPopularTagsForDatasets());
        if (!tags) {
            throw new Error(`Unable to retrieve most popular tags for published datasets`);
        }
        response.data = tags;
    }
};