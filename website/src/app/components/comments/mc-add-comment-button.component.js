class MCAddCommentButtonController {
    constructor() {
        console.log("MCAddCommentButtonController")
    }

    requestAddCommentAction() {
        console.log("Before: Make Request to add comment");
        this.action()
        console.log("After: Make Request to add comment");
    }
}

angular.module('materialscommons').component('mcAddCommentButton', {
    templateUrl: 'app/components/comments/mc-add-comment-button.html',
    controller: MCAddCommentButtonController,
    bindings: {
        action: '&'
    }
});
