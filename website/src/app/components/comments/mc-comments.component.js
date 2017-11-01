class MCCommentsComponentController {
    constructor(User,$mdDialog, commentsAPI) {
        this.user = User.u();
        this.$mdDialog = $mdDialog;
        this.commentsAPIService = commentsAPI;
        this.loggedin = (this.user !== "Login");
        console.log("MCCommentsComponentController");
        console.log("comments: ",this.comments);
        console.log("onChangeComments: ",this.onChangeComments);
    }

    addEditComment(id) {
        console.log("Add-Edit",id)
        let comment = null;
        if (id) {
            for (let i = 0; i < this.comments.length; i++) {
                if (id === this.comments[i].id) {
                    comment = this.comments[i];
                    break;
                }
            }
        }
        console.log("with text: ", (comment)?comment.text:'');
        this.$mdDialog.show({
            templateUrl: 'app/components/comments/add-edit-comment.html',
            controller: AddEditDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                id: (comment)?comment.id:null,
                text: (comment)?comment.text:'',
                source: comment
            }
        }).then(
            (values) => {
                if (values.source) {
                    comment = values.source;
                    if (values.text !== '')
                        comment.text = values.text;
                    console.log("update", comment);
                    this.commentsAPIService.createComment(comment)
                        .then(x => {this.onChangeComments();})
                } else {
                    comment = {
                        'text': values.text,
                        'item_type': this.target.otype,
                        'item_id': this.target.id
                    }
                    console.log("add", comment);
                    this.commentsAPIService.updateComment(comment)
                        .then(x => {this.onChangeComments();})
                }
            }
        );
    }

    deleteComment(id) {
        console.log("Delete",id)
        this.$mdDialog.show({
            templateUrl: 'app/components/comments/delete-comment.html',
            controller: DeleteDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                id: id
            }
        }).then(() => {

            this.onChangeComments();
        });
    }

    refreshCommentsList() {
        console.log("Refresh")
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
        console.log("AddEditDialogController: done")
        this.$mdDialog.hide({
            id: this.id,
            text: this.text,
            source: this.source
        });
    }

    cancel() {
        console.log("AddEditDialogController: cancel")
        this.$mdDialog.cancel();
    }
}

class DeleteDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        console.log("AddEditDialogController: done")
        console.log("Would delete comment: ", this.id)
        this.$mdDialog.hide();
    }

    cancel() {
        console.log("AddEditDialogController: cancel")
        this.$mdDialog.cancel();
    }
}
