class MCAdminInfoComponentController {
    /*@ngInject*/
    constructor(User) {
        this.isAdmin = false;
        if (User.isAuthenticated()) {
            this.isAdmin = User.attr().admin;
        }
    }
}

angular.module('materialscommons').component('mcAdminInfo', {
    template: require('./mc-admin-info.html'),
    controller: MCAdminInfoComponentController
});
