class MCCommentsItemController {
    constructor(User) {
        this.userid = User.u();
        this.loggedin = User.isAuthenticated();
        console.log("MCCommentsItemController", this.comment)
    }
}

angular.module('materialscommons').component('mcCommentsItem', {
    templateUrl: 'app/components/comments/mc-comments-item.html',
    controller: MCCommentsItemController,
    bindings: {
        comment: "<",
    }
});
