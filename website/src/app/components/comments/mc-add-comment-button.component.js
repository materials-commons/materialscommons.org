class MCAddCommentButtonController {
    constructor() {
    }

    requestAddCommentAction() {
        this.onAdd();
    }
}

angular.module('materialscommons').component('mcAddCommentButton', {
    template: require('./mc-add-comment-button.html'),
    controller: MCAddCommentButtonController,
    bindings: {
        onAdd: '&'
    }
});
