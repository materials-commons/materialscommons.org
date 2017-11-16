class PublicDatasetsAPIService {
    /*@ngInject*/
    constructor(publicAPIRoute) {
        this.publicAPIRoute = publicAPIRoute;
    }

    getTopViewed() {
        return this.publicAPIRoute('datasets').one('filter').one('views').getList().then(
            (datasets) => {
                datasets = datasets.plain();
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
                return datasets;
            }
        );
    }

    getDataset(datasetId) {
        return this.publicAPIRoute('datasets', datasetId).get().then(
            (dataset) => {
                dataset = dataset.plain();
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
}

angular.module('materialscommons').service('publicDatasetsAPI', PublicDatasetsAPIService);
