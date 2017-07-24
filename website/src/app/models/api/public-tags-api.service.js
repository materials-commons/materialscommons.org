class PublicTagsAPIService {
    constructor(publicAPIRoute) {
        this.publicAPIRoute = publicAPIRoute;
    }

    getPopularTags() {
        return this.publicAPIRoute('tags').one('popular').getList().then(
            (tags) => tags.plain()
        );
    }
}

angular.module('materialscommons').service('publicTagsAPI', PublicTagsAPIService);
