class CommentsAPIService {
    constructor(Restangular) {
        this.Restangular = Restangular;
    }

    createComment(comment) {
        return this.Restangular.one('v2').one('comments').customPOST(comment)
            .then(comment => comment.plain());
    }

    updateComment(comment) {
        return this.Restangular.one('v2').one('comments', comment.id).customPUT(comment)
            .then(comment => comment.plain());
    }

    updateComment(comment) {
        return this.Restangular.one('v2').one('comments', comment.id).customDELETE()
            .then(rv => rv.plain());
    }
}

angular.module('materialscommons').service('commentsAPI', CommentsAPIService);
