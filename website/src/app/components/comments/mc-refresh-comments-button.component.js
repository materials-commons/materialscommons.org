class MCRefreshCommentButtonController {
    constructor() {
    }

    requestRefreshCommentAction() {
        this.onRefresh()
    }
}

angular.module('materialscommons').component('mcRefreshCommentsButton', {
    template: require('./mc-refresh-comments-button.html'),
    controller: MCRefreshCommentButtonController,
    bindings: {
        onRefresh: '&'
    }
});
