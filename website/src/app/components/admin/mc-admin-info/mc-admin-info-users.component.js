class MCAdminInfoUsersComponentController {
    /*@ngInject*/
    constructor(usersAdminInfoAPI, toast) {
        console.log("Constructor - MCAdminInfoUsersComponentController");
        this.usersAdminInfoAPI = usersAdminInfoAPI;
        this.toast = toast;
        this.allUsers = [];
        this.filterUsersBy = "";
        this.userCount = 0;
        console.log(this.usersAdminInfoAPI);
    }

    $onInit() {
        console.log("Init - MCAdminInfoUsersComponentController");
        this.usersAdminInfoAPI.getUsersAdminInfo().then(
            (val_ret) => {
                this.allUsers = val_ret.val;
                console.log(this.allUsers);
        });
    }

}

angular.module('materialscommons').component('mcAdminInfoUsers', {
    template: require('./mc-admin-info-users.html'),
    controller: MCAdminInfoUsersComponentController
});
