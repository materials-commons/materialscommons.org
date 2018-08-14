class MCAdminInfoUsersComponentController {
    /*@ngInject*/
    constructor(usersAdminInfoAPI, toast) {
        this.usersAdminInfoAPI = usersAdminInfoAPI;
        this.toast = toast;
        this.allUsers = [];
        this.filterUsersBy = "";
        this.userCount = 0;
    }

    $onInit() {
        this.usersAdminInfoAPI.getUsersAdminInfo().then(
            (val_ret) => {
                this.allUsers = val_ret.val;
                this.userCount = this.allUsers.length;
        });
    }

}

angular.module('materialscommons').component('mcAdminInfoUsers', {
    template: require('./mc-admin-info-users.html'),
    controller: MCAdminInfoUsersComponentController
});
