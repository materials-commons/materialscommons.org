class MCRefreshCommentButtonController {
    constructor() {
    }

    requestRefreshCommentAction() {
        this.action()
    }
}

angular.module('materialscommons').component('mcRefreshCommentsButton', {
    templateUrl: 'app/components/comments/mc-refresh-comments-button.html',
    controller: MCRefreshCommentButtonController,
    bindings: {
        action: '&'
    }
});
