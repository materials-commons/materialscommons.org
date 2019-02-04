class PublicDatasetsAPIService {
    /*@ngInject*/
    constructor(publicAPIRoute, Restangular) {
        this.publicAPIRoute = publicAPIRoute;
        this.Restangular = Restangular;
    }

    getTopViewed() {
        return this.Restangular.one('v3').one('getTopViewedPublishedDatasets').customPOST().then(
            (ds) => {
                let datasets = ds.plain().data;
                datasets = this.augmentDatasets(datasets);
                return datasets;
            }
        );
    }

    getRecent() {
        return this.Restangular.one('v3').one('getRecentlyPublishedDatasets').customPOST().then(
            (ds) => {
                let datasets = ds.plain().data;
                for (let dataset of datasets) {
                    dataset.birthtime = new Date(ds.birthtime);
                }
                datasets = this.augmentDatasets(datasets);
                return datasets;
            }
        );
    }

    getDataset(datasetId) {
        return this.Restangular.one('v3').one('getPublishedDataset').customPOST({dataset_id: datasetId}).then(
            (ds) => {
                let dataset = ds.plain().data;
                return this.augmentDataset(dataset);
            }
        );
    }

    getDatasetProcess(datasetId, processId) {
        return this.Restangular.one('v3').one('getPublishedDatasetProcess').customPOST({
            dataset_id: datasetId,
            process_id: processId
        }).then(
            (process) => process.plain().data
        );
    }

    getDatasetsForTag(tag) {
        return this.publicAPIRoute('tags', tag).one('datasets').getList().then(
            (datasets) => {
                datasets = datasets.plain();
                datasets = this.augmentDatasets(datasets);
                return datasets;
            }
        );
    }

    datasetWasViewed(userId, datasetId) {
        let viewParams = {
            item_type: 'dataset',
            item_id: datasetId,
            user_id: userId
        };
        return this.publicAPIRoute('views').customPOST(viewParams).then(
            () => {
                return this.getDataset(datasetId).then(
                    (dataset) => {
                        return dataset;
                    }
                );
            }
        );
    }

    datasetWasDownloaded(userId, datasetId) {
        return this.getDataset(datasetId).then(
            (dataset) => {
                return dataset;
            }
        );
    }

    updateUseful(userId, datasetId, isUseful) {
        let usefulParams = {
            item_type: 'dataset',
            item_id: datasetId,
            user_id: userId,
            action: isUseful ? 'add' : 'delete'
        };
        return this.publicAPIRoute('useful').customPOST(usefulParams).then(
            () => {
                return this.getDataset(datasetId).then(
                    (dataset) => {
                        return dataset;
                    }
                );
            }
        );
    }

    augmentDataset(dataset) {
        dataset.stats.useful_count = dataset.stats.interested_users.length;
        dataset.stats.download_count = dataset.download_count || 0;
        return dataset;
    }

    augmentDatasets(datasets) {
        for (let i = 0; i < datasets.length; i++) {
            datasets[i] = this.augmentDataset(datasets[i]);
        }
        return datasets;
    }
}

angular.module('materialscommons').service('publicDatasetsAPI', PublicDatasetsAPIService);
