class MCAddCommentButtonController {
    constructor() {
    }

    requestAddCommentAction() {
        this.action()
    }
}

angular.module('materialscommons').component('mcAddCommentButton', {
    templateUrl: 'app/components/comments/mc-add-comment-button.html',
    controller: MCAddCommentButtonController,
    bindings: {
        action: '&'
    }
});
