const {Action, api} = require('actionhero');
const dal = require('@dal');
const fs = require('fs');
const path = require('path');

module.exports.GetTopViewedPublishedDatasetsAction = class GetTopViewedPublishedDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'getTopViewedPublishedDatasets';
        this.description = 'Returns the most viewed datasets';
        this.do_not_authenticate = true;
    }

    async run({response}) {
        const topViewedDatasets = await dal.tryCatch(async() => await api.mc.publishedDatasets.getTopViewedDatasets());
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
        const recentlyPublishedDatasets = await dal.tryCatch(async() => await api.mc.publishedDatasets.getRecentlyPublishedDatasets());

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
        const ds = await dal.tryCatch(async() => await api.mc.publishedDatasets.getDataset(params.dataset_id));
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
        const datasetsForTag = await dal.tryCatch(async() => await api.mc.publishedDatasets.getDatasetsForTag(params.tag_id));
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
        const process = await dal.tryCatch(async() => await api.mc.publishedDatasets.getProcessForDataset(params.dataset_id, params.process_id));
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
        const comments = await dal.tryCatch(async() => await api.mc.publishedDatasets.getCommentsForDataset(params.dataset_id));
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
        this.description = 'Increments the published datasets view count and returns dataset';
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
        const dataset = await dal.tryCatch(async() => await api.mc.publishedDatasets.incrementViewForDataset(params.dataset_id, userId));
        if (!dataset) {
            throw new Error(`Unable to update dataset ${params.dataset_id} view count`);
        }
        response.data = dataset;
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
        let ds;

        if (params.action === 'add') {
            ds = await dal.tryCatch(async() => await api.mc.publishedDatasets.markDatasetAsUseful(params.dataset_id, params.user_id));
        } else {
            // params.action === 'delete'
            ds = await dal.tryCatch(async() => await api.mc.publishedDatasets.unmarkDatasetAsUseful(params.dataset_id, params.user_id));
        }

        if (!ds) {
            throw new Error(`Unable to ${params.action === 'add' ? 'mark' : 'unmark'} dataset ${params.dataset_id} for user ${params.user_id}`);
        }

        response.data = ds;
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
        const tags = await dal.tryCatch(async() => await api.mc.publishedDatasets.getMostPopularTagsForDatasets());
        if (!tags) {
            throw new Error(`Unable to retrieve most popular tags for published datasets`);
        }
        response.data = tags;
    }
};

module.exports.DownloadDatasetZipfileAction = class DownloadDatasetZipFileAction extends Action {
    constructor() {
        super();
        this.name = 'downloadDatasetZipfile';
        this.description = 'Returns the zipfile and updates the downloads count';
        this.inputs = {
            dataset_id: {
                required: true
            }
        };
    }

    async run(data) {
        const filepath = await dal.tryCatch(async() => await api.mc.publishedDatasets.updataDownloadCountAndReturnFilePath(data.params.dataset_id));
        if (!filepath) {
            throw new Error(`Unable to retrieve zip file for dataset ${data.params.dataset_id}`);
        }

        const filename = path.basename(filepath);
        let fstream = fs.createReadStream(filepath);
        data.connection.rawConnection.responseHeaders.push(['Content-Disposition', `attachment; filename=${filename}`]);
        api.mc.servers.servers.web.sendFile(data.connection, null, fstream, 'application/zip');
        data.toRender = false;
    }
};