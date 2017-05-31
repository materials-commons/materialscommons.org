export function CommentDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/details/comments.html',
        scope: {
            comments: "=",
            datasetId: "=",
            user: "="
        },
        controller: CommentController,
        controllerAs: 'ctrl',
        bindToController: true
    };
    return directive;
}

class CommentController {

    constructor(actionsService, userService) {
        'ngInject';
        this.actionsService = actionsService;
        this.user = userService.u();
    }

    getActions() {
        this.actionsService.getAllActions(this.datasetId).then((result) => {
            this.comments = result.comments;
        });
    }

    addComment() {
        if (this.user) {
            this.actionsService.addComment(this.comment, this.datasetId, this.user.id).then(() => {
                this.getActions();
                this.comment = "";
            });
        } else {
            toastr.warning("Please sign in to add comment");
        }
    }
}
