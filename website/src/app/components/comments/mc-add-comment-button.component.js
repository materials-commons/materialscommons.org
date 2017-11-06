class MCAddCommentButtonController {
    constructor() {
    }

    requestAddCommentAction() {
        console.log("requestAddCommentAction");
        this.onAdd();
    }
}

angular.module('materialscommons').component('mcAddCommentButton', {
    templateUrl: 'app/components/comments/mc-add-comment-button.html',
    controller: MCAddCommentButtonController,
    bindings: {
        onAdd: '&'
    }
});
