class MCCommentItemController {
    constructor(User) {
        this.userid = User.u();
        this.loggedin = User.isAuthenticated();
    }

    addComment() {
        this.onAdd();
    }

    editComment() {
        this.onEdit({id: this.comment.id, text: this.comment.text})
    }

    deleteComment() {
        this.onDelete({id: this.comment.id});
    }
}

angular.module('materialscommons').component('mcCommentItem', {
    templateUrl: 'app/components/comments/mc-comment-item.html',
    controller: MCCommentItemController,
    bindings: {
        comment: "<",
        onAdd: "&",
        onEdit: "&",
        onDelete: "&"
    }
});
