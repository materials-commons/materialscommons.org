class MCAdminInfoComponentController {
    /*@ngInject*/
    constructor(User, toast) {
        console.log("Constructor - MCAdminInfoComponentController");
        this.isAdmin = false;
        if (User.isAuthenticated()) {
            this.isAdmin = User.attr().admin;
        }
        console.log(this.isAdmin);
        this.toast = toast;
    }
}

angular.module('materialscommons').component('mcAdminInfo', {
    template: require('./mc-admin-info.html'),
    controller: MCAdminInfoComponentController
});
