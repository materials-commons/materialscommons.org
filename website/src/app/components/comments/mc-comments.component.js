class MCCommentsComponentController {
    constructor(User) {
        this.user = User.u();
        this.loggedin = (this.user !== "Login");
        console.log("MCCommentsComponentController")
        console.log("comments: ",this.comments)
    }

    addComment() {
        console.log("Add")
    }

    editComment(id) {
        console.log("Edit",id)
    }

    deleteComment(id) {
        console.log("Delete",id)
    }

    refreshCommentsList() {
        console.log("Refresh")
    }
}

angular.module('materialscommons').component('mcComments', {
    templateUrl: 'app/components/comments/mc-comments.html',
    controller: MCCommentsComponentController,
    bindings: {
        comments: '<'
    }
});

// angular.module('materialscommons').directive('mcCommentsButton', mcCommentsButtonDirective);
