class PublicCommentsAPIService {
    constructor(publicAPIRoute) {
        this.publicAPIRoute = publicAPIRoute;
    }

    getCommentsListFor(targetId) {
        return this.publicAPIRoute('comments').get({target: targetId}).then(
            (rv) => {
                rv = rv.plain();
                return rv.val;
            }
        );
    }
}

angular.module('materialscommons').service('publicCommentsAPI', PublicCommentsAPIService);
