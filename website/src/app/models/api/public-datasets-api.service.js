class PublicDatasetsAPIService {
    /*@ngInject*/
    constructor(publicAPIRoute) {
        this.publicAPIRoute = publicAPIRoute;
    }

    getTopViewed() {
        return this.publicAPIRoute('datasets').one('filter').one('views').getList().then(
            (datasets) => {
                datasets = datasets.plain();
                // augment each dataset with fake stats values - for GUI development
                // augment each dateset with enhanced publisher value - for GUI development
                for (let i = 0; i < datasets.length; i++){
                    datasets[i] = this.augmentDatasetWithStats(datasets[i]);
                    datasets[i] = this.augmentDatasetPublisher(datasets[i]);
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
                // augment each dataset with fake stats values - for GUI development
                // augment each dateset with enhanced publisher value - for GUI development
                for (let i = 0; i < datasets.length; i++){
                    datasets[i] = this.augmentDatasetWithStats(datasets[i]);
                    datasets[i] = this.augmentDatasetPublisher(datasets[i]);
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
                dataset = this.augmentDatasetWithStats(dataset);
                // augment dateset with enhanced publisher value - for GUI development
                dataset = this.augmentDatasetPublisher(dataset)
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
                // augment each dataset with fake stats values - for GUI development
                // augment each dateset with enhanced publisher value - for GUI development
                for (let i = 0; i < datasets.length; i++){
                    datasets[i] = this.augmentDatasetWithStats(datasets[i]);
                    datasets[i] = this.augmentDatasetPublisher(datasets[i]);
                }
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
                this.getDataset(datasetId).then(
                    (dataset) => {
                        console.log(dataset);
                        return dataset;
                    }
                )
            }
        )
    }

    // augment dataset with fake stats values - for GUI development
    augmentDatasetWithStats(dataset) {
        let stats = {
            comment_count: dataset.comment_count || 3,
            unique_view_count: {
                authenticated: 4,
                anonymous: 5,
                total: 9
            },
            download_count: 2,
            useful_count: 6
        };
        dataset.stats = stats;
        return dataset;
    }

    // augment dateset with enhanced publisher value - for GUI development
    augmentDatasetPublisher(dataset) {
        let publisher = {
            fullname: dataset.publisher,
            email: "fake.email@mc.test"
        }
        dataset.publisher = publisher;
        return dataset;
    }

}

angular.module('materialscommons').service('publicDatasetsAPI', PublicDatasetsAPIService);
