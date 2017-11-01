class MCCommentsComponentController {
    constructor(User, $mdDialog, commentsAPI) {
        this.user = User.u();
        this.$mdDialog = $mdDialog;
        this.commentsAPIService = commentsAPI;
        this.loggedin = (this.user !== "Login");
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
                            this.onChangeComments();
                        });
                } else {
                    comment = {
                        'text': values.text,
                        'item_type': this.target.otype,
                        'item_id': this.target.id
                    };
                    this.commentsAPIService.createComment(comment)
                        .then(() => {
                            this.onChangeComments();
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
                    this.onChangeComments();
                })
        });
    }

    refreshCommentsList() {
        this.onChangeComments();
    }
}

angular.module('materialscommons').component('mcComments', {
    templateUrl: 'app/components/comments/mc-comments.html',
    controller: MCCommentsComponentController,
    bindings: {
        comments: '=',
        target: "<",
        onChangeComments: '&'
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
