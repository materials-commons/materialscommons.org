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
            let text = val.text
            if (text !== '') {
                this.createNewComment(text, this.targetType, this.targetId);
            }
        });
    }

    createNewComment(text, type, id) {
        let comment = {
            'text': text,
            'item_type': type,
            'item_id': id
        };
        this.commentsAPIService.createComment(comment)
            .then(() => {
                this.refreshCommentsList();
            });
    }

    editComment(id, text) {
        this.showEditDialog(text).then((val) => {this.updateComment(id, val.text);});
    }

    updateComment(id, text) {
        let comment = {
            id: id,
            text: text
        }
        this.commentsAPIService.updateComment(comment).then(() => {
            this.refreshCommentsList();
        });
    }

    deleteComment(id) {
        this.showDeleteDialog(id).then(() => {this.deleteConfirmed(id);});
    }

    showAddDialog() {
        return this.$mdDialog.show({
            templateUrl: 'app/components/comments/dialog-add-comment.html',
            controller: AddDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
        });
    }

    showEditDialog(previousText) {
        return this.$mdDialog.show({
            templateUrl: 'app/components/comments/dialog-edit-comment.html',
            controller: EditDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                text: previousText,
            }
        })
    }

    showDeleteDialog(id) {
        return this.$mdDialog.show({
            templateUrl: 'app/components/comments/dialog-delete-comment.html',
            controller: DeleteDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                id: id
            }
        })
    }

    deleteConfirmed(id){
        this.commentsAPIService.deleteComment(id)
            .then(() => {
                this.refreshCommentsList();
        });
    }

    refreshCommentsList() {
        this.publicCommentsAPIService.getCommentsListFor(this.targetId)
            .then((commentsList) => {
                console.log(commentsList);
                this.comments = commentsList;
                console.log("Refresh comment list");
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

class AddDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide({
            text: this.text,
        });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class EditDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide({
            text: this.text,
        });
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
