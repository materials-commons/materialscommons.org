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
    }

    $onInit() {
        this.refreshCommentsList();
    }

    addComment() {
        this.showAddDialog().then((val) => {
            let text = val.text;
            if (text !== '') {
                this.createNewComment(this.targetType, this.targetId, text);
                this.onAddToCommentCount();
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
            templateUrl: 'app/modals/dialog-add-comment.html',
            controller: AddEditDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
        });
    }

    showEditDialog(previousText) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/dialog-edit-comment.html',
            controller: AddEditDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                text: previousText,
            }
        })
    }

    showDeleteDialog() {
        var confirm = this.$mdDialog.confirm()
          .title(`Delete comment on ${this.targetType}.`)
          .ariaLabel(`Delete comment on ${this.targetType}.`)
          .ok('Delete')
          .cancel('Cancel');
        return this.$mdDialog.show(confirm);
    }

    deleteConfirmed(id) {
        this.commentsAPIService.deleteComment(id)
            .then(() => {
                this.refreshCommentsList();
                this.onDeleteFromCommentCount();
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
    template: require('./mc-comments-list.html'),
    controller: MCCommentsListComponentController,
    bindings: {
        target: "<",
        onAddToCommentCount: '&',
        onDeleteFromCommentCount: '&'
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
