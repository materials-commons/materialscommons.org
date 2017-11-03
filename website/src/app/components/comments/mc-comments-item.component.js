class MCCommentsItemController {
    constructor(User) {
        this.userid = User.u();
        this.loggedin = User.isAuthenticated();
        console.log("MCCommentsItemController");
    }

    addComment() {
        this.onAdd();
    }

    editComment(){
        this.onEdit({id: this.comment.id, text: this.comment.text})
    }

    deleteComment(){
        this.onDelete({id: this.comment.id});
    }
}

angular.module('materialscommons').component('mcCommentsItem', {
    templateUrl: 'app/components/comments/mc-comments-item.html',
    controller: MCCommentsItemController,
    bindings: {
        comment: "<",
        onAdd: "&",
        onEdit: "&",
        onDelete: "&"
    }
});
