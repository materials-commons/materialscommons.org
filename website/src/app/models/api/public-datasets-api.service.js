class PublicDatasetsAPIService {
    /*@ngInject*/
    constructor(publicAPIRoute) {
        this.publicAPIRoute = publicAPIRoute;
    }

    getTopViewed() {
        return this.publicAPIRoute('datasets').one('filter').one('views').getList().then(
            (datasets) => {
                datasets = datasets.plain();
                // augment datasets in list with fake stats values - for GUI development
                for (let i = 0; i < datasets.length; i++){
                    datasets[i] = this.augmentDatasetWithStats(i,datasets[i]);
                }
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
                // augment datasets in list with fake stats values - for GUI development
                for (let i = 0; i < datasets.length; i++){
                    datasets[i] = this.augmentDatasetWithStats(i,datasets[i]);
                }
                return datasets;
            }
        );
    }

    getDataset(datasetId) {
        return this.publicAPIRoute('datasets', datasetId).get().then(
            (dataset) => {
                dataset = dataset.plain();
                // augment dataset with fake stats values - for GUI development
                dataset = this.augmentDatasetWithStats(0,dataset);
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
                // augment datasets in list with fake stats values - for GUI development
                for (let i = 0; i < datasets.length; i++){
                    datasets[i] = this.augmentDatasetWithStats(i,datasets[i]);
                }
                return datasets;
            }
        );
    }

    augmentDatasetWithStats(i,dataset) {
        let stats = {
            comment_count: dataset.comment_count,
            unique_view_count: {
                authenticated: 14 + 2*i,
                anonymous: 15 - i,
                total: 29 + i
            },
            download_count: 20 + i,
            favorite_count: 30 - 1
        };
        dataset.stats = stats;
        return dataset;
    }
}

angular.module('materialscommons').service('publicDatasetsAPI', PublicDatasetsAPIService);
