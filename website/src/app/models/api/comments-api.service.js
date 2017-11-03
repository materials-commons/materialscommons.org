class CommentsAPIService {
    constructor(Restangular) {
        this.Restangular = Restangular;
    }

    createComment(targetType, targetId, text) {
        let data = {
            'item_type': targetType,
            'item_id': targetId,
            'text': text
        };
        return this.Restangular.one('v2').one('comments').customPOST(data)
            .then(comment => comment.plain());
    }

    updateComment(commentId, text) {
        let data = {
            text: text
        }
        return this.Restangular.one('v2').one('comments', commentId).customPUT(data)
            .then(comment => comment.plain());
    }

    deleteComment(id) {
        return this.Restangular.one('v2').one('comments', id).customDELETE()
            .then(rv => rv.plain());
    }
}

angular.module('materialscommons').service('commentsAPI', CommentsAPIService);
