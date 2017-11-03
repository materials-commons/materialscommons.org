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
        console.log("MCCommentsListComponentController");
    }

    addComment() {
        console.log("actually add the comment", this.targetType, this.targetId);
    }

    addEditComment(id) {
        let comment = null;
        if (id) {
            for (let i = 0; i < this.comments.length; i++) {
                if (id === this.comments[i].id) {
                    comment = this.comments[i];
                    break;
                }
            }
        }
        this.$mdDialog.show({
            templateUrl: 'app/components/comments/add-edit-comment.html',
            controller: AddEditDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                text: (comment) ? comment.text : '',
                source: comment
            }
        }).then(
            (values) => {
                if (values.source) {
                    comment = values.source;
                    if (values.text !== '')
                        comment.text = values.text;
                    this.commentsAPIService.updateComment(comment)
                        .then(() => {
                            this.refreshCommentsList();
                        });
                } else {
                    comment = {
                        'text': values.text,
                        'item_type': this.target.otype,
                        'item_id': this.target.id
                    };
                    this.commentsAPIService.createComment(comment)
                        .then(() => {
                            this.refreshCommentsList();
                        });
                }
            }
        );
    }

    deleteComment(id) {
        this.$mdDialog.show({
            templateUrl: 'app/components/comments/delete-comment.html',
            controller: DeleteDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                id: id
            }
        }).then(() => {
            this.commentsAPIService.deleteComment(id)
                .then(() => {
                    this.refreshCommentsList();
                })
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

class AddEditDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide({
            id: this.id,
            text: this.text,
            source: this.source
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
