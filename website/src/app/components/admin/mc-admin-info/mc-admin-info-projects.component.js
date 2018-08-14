class MCAdminInfoProjectsComponentController {
    /*@ngInject*/
    constructor(usersAdminInfoAPI, toast) {
        console.log("Constructor - MCAdminInfoProjectsComponentController");
        this.usersAdminInfoAPI = usersAdminInfoAPI;
        this.toast = toast;
        this.projectsCount = 0;
        this.allProjeccts = [];
    }

    $onInit() {
        console.log("Init - MCAdminInfoProjectsComponentController");
        this.usersAdminInfoAPI.getUsersAdminInfo().then(
            (val_ret) => {
                this.allUsers = val_ret.val;
                console.log(this.allUsers);
        });
    }

}

angular.module('materialscommons').component('mcAdminInfoProjects', {
    template: require('./mc-admin-info-projects.html'),
    controller: MCAdminInfoProjectsComponentController
});
