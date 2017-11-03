class MCAddCommentButtonController {
    constructor() {
        console.log("MCAddCommentButtonController")
    }

    requestAddCommentAction() {
        console.log("Make Request to add comment");
        this.action();
    }
}

angular.module('materialscommons').component('mcAddCommentButton', {
    templateUrl: 'app/components/comments/mc-add-comment-button.html',
    controller: MCAddCommentButtonController,
    bindings: {
        action: '&'
    }
});
