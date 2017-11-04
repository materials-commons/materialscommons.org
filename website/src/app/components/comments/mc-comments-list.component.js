class MCCommentsListComponentController {
    constructor(User, $mdDialog, commentsAPI, publicCommentsAPI) {
        this.userid = User.u();
        this.loggedin = User.isAuthenticated();
        this.$mdDialog = $mdDialog;
        this.commentsAPIService = commentsAPI;
        this.publicCommentsAPIService = publicCommentsAPI;
        this.targetType = this.target.otype;
        this.targetId = this.target.id;
        this.comments = [];
        this.refreshCommentsList();
    }

    addComment() {
        this.showAddDialog().then((val) => {
            let text = val.text;
            if (text !== '') {
                this.createNewComment(this.targetType, this.targetId, text);
            }
        });
    }

    createNewComment(targetType, targetId, text) {
        this.commentsAPIService.createComment(targetType, targetId, text)
            .then(() => {
                this.refreshCommentsList();
            });
    }

    editComment(commentId, text) {
        this.showEditDialog(text).then((val) => {
            this.updateComment(commentId, val.text);
        });
    }

    updateComment(commentId, text) {
        this.commentsAPIService.updateComment(commentId, text).then(() => {
            this.refreshCommentsList();
        });
    }

    deleteComment(id) {
        this.showDeleteDialog().then(() => {
            this.deleteConfirmed(id);
        });
    }

    showAddDialog() {
        return this.$mdDialog.show({
            templateUrl: 'app/components/comments/dialog-add-comment.html',
            controller: AddEditDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
        });
    }

    showEditDialog(previousText) {
        return this.$mdDialog.show({
            templateUrl: 'app/components/comments/dialog-edit-comment.html',
            controller: AddEditDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                text: previousText,
            }
        })
    }

    showDeleteDialog() {
        return this.$mdDialog.show({
            templateUrl: 'app/components/comments/dialog-delete-comment.html',
            controller: DeleteDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
        })
    }

    deleteConfirmed(id) {
        this.commentsAPIService.deleteComment(id)
            .then(() => {
                this.refreshCommentsList();
            });
    }

    refreshCommentsList() {
        this.publicCommentsAPIService.getCommentsListFor(this.targetId)
            .then((commentsList) => {
                this.comments = commentsList;
            });
    }
}

angular.module('materialscommons').component('mcCommentsList', {
    templateUrl: 'app/components/comments/mc-comments-list.html',
    controller: MCCommentsListComponentController,
    bindings: {
        target: "<",
    }
});

class AddEditDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide({text: this.text});
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class DeleteDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
