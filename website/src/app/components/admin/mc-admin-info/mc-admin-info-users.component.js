class MCAdminInfoUsersComponentController {
    /*@ngInject*/
    constructor(mcapi, toast) {
        this.mcapi = mcapi;
        this.toast = toast;
        this.allUsers = [];
        this.filterUsersBy = "";
        this.userCount = 0;
    }

    $onInit() {
        console.log("Init - MCAdminInfoUsersComponentController");
        this.mcapi('/users').success(function (users) {
            console.log(users);
            this.allUsers = users;
        }).jsonp();
    }

}

angular.module('materialscommons').component('mcAdminInfoUsers', {
    template: require('./mc-admin-info-users.html'),
    controller: MCAdminInfoUsersComponentController
});
