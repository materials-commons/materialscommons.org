class PublicDatasetsAPIService {
    /*@ngInject*/
    constructor(publicAPIRoute) {
        this.publicAPIRoute = publicAPIRoute;
    }

    getTopViewed() {
        return this.publicAPIRoute('datasets').one('filter').one('views').getList().then(function(releases) {
            return releases.plain();
        });
    }

    getRecent() {
        return this.publicAPIRoute('datasets').one('filter').one('recent').getList().then(
            (datasets) => {
                for (let ds of datasets) {
                    ds.birthtime = new Date(ds.birthtime);
                }
                return datasets.plain();
            }
        );
    }

    getDataset(datasetId) {
        return this.publicAPIRoute('datasets', datasetId).get().then(
            (dataset) => dataset.plain()
        );
    }

    getDatasetProcess(datasetId, processId) {
        return this.publicAPIRoute('datasets').one(datasetId).one('processes', processId).get().then(
            (process) => process.plain()
        )
    }
}


angular.module('materialscommons').service('publicDatasetsAPI', PublicDatasetsAPIService);
