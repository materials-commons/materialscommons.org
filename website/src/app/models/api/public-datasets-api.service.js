class PublicDatasetsAPIService {
    /*@ngInject*/
    constructor(publicAPIRoute) {
        this.publicAPIRoute = publicAPIRoute;
    }

    getTopViewed() {
        return this.publicAPIRoute('datasets').one('filter').one('views').getList().then(
            (datasets) => {
                datasets = datasets.plain();
                datasets = this.augmentDatasets(datasets);
                return datasets;
            }
        );
    }

    getRecent() {
        return this.publicAPIRoute('datasets').one('filter').one('recent').getList().then(
            (datasets) => {
                for (let ds of datasets) {
                    ds.birthtime = new Date(ds.birthtime);
                }
                datasets = datasets.plain();
                datasets = this.augmentDatasets(datasets);
                return datasets;
            }
        );
    }

    getDataset(datasetId) {
        return this.publicAPIRoute('datasets', datasetId).get().then(
            (dataset) => {
                dataset = dataset.plain();
                dataset = this.augmentDataset(dataset);
                return dataset;
            }
        );
    }

    getDatasetProcess(datasetId, processId) {
        return this.publicAPIRoute('datasets').one(datasetId).one('processes', processId).get().then(
            (process) => process.plain()
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
                )
            }
        )
    }

    datasetWasDownloaded(userId, datasetId) {
        console.log("------------> unimplemented <----------------");
        console.log("|  datasetWasDownloaded(userId, datasetId)  |")
        console.log("------------> unimplemented <----------------");
        return this.getDataset(datasetId).then(
            (dataset) => {
                return dataset;
            }
        )
    }

    updateUseful(userId, datasetId, isUseful) {
        let usefulParams = {
            item_type: 'dataset',
            item_id: datasetId,
            user_id: userId,
            action: isUseful?"add":"delete"
        };
        return this.publicAPIRoute('useful').customPOST(usefulParams).then(
            () => {
                console.log("updateUseful: then from publicAPIRoute call;");
                return this.getDataset(datasetId).then(
                    (dataset) => {
                        console.log("updateUseful: then from getDataset call;");
                        console.log('getDataset: ',dataset);
                        return dataset;
                    }
                )
            }
        )
    }

    augmentDataset(dataset) {
        dataset.stats.useful_count = dataset.stats.interested_users.length;
        console.log("augmentDataset(dataset): useful_count", dataset.id, dataset.stats.useful_count);
        dataset.stats.download_count = dataset.download_count || 0;
        console.log("augmentDataset(dataset): download_count", dataset.id, dataset.stats.download_count);
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
