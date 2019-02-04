class PublicTagsAPIService {
    constructor(Restangular) {
        this.Restangular = Restangular;
    }

    getPopularTags() {
        return this.Restangular.one('v3').one('getPopularTagsForPublishedDatasets').customPOST().then(
            (tags) => tags.plain().data
        );
    }
}

angular.module('materialscommons').service('publicTagsAPI', PublicTagsAPIService);
