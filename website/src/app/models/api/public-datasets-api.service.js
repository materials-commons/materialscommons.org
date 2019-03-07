class PublicDatasetsAPIService {
    /*@ngInject*/
    constructor(Restangular) {
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
        return this.Restangular.one('v3').one('getPublishedDatasetsForTag').customPOST({tag_id: tag}).then(
            (ds) => {
                let datasets = ds.plain().data;
                return this.augmentDatasets(datasets);
            }
        );
    }

    datasetWasViewed(userId, datasetId) {
        return this.Restangular.one('v3').one('incrementPublishedDatasetViews').customPOST({
            dataset_id: datasetId,
            user_id: userId,
        }).then(
            (ds) => {
                let dataset = ds.plain().data;
                return this.augmentDataset(dataset);
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
        return this.Restangular.one('v3').one('updatePublishedDatasetUsefulCount').customPOST({
            dataset_id: datasetId,
            user_id: userId,
            action: isUseful ? 'add' : 'delete'
        }).then(
            ds => {
                let dataset = ds.plain().data;
                return this.augmentDataset(dataset);
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
