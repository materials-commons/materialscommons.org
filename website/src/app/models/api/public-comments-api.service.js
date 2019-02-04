class PublicCommentsAPIService {
    constructor(Restangular) {
        this.Restangular = Restangular;
    }

    getCommentsListFor(datasetId) {
        return this.Restangular.one('v3').one('getCommentsForPublishedDataset').customPOST({dataset_id: datasetId}).then(
            (ds) => ds.plain().data
        );
    }
}

angular.module('materialscommons').service('publicCommentsAPI', PublicCommentsAPIService);
