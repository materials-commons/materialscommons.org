class MCAdminInfoProjectsComponentController {
    /*@ngInject*/
    constructor(projectsAPI, toast) {
        console.log("Constructor - MCAdminInfoProjectsComponentController");
        this.projectsAPIService = projectsAPI;
        this.toast = toast;
        this.projectsCount = 0;
        this.allProjeccts = [];
    }

    $onInit() {
        console.log("Init - MCAdminInfoProjectsComponentController");
        this.projectsAPIService.getAllProjects().then(
            (val_ret) => {
                console.log(val_ret);
                this.allProjeccts = val_ret.val;
                console.log(this.allProjeccts);
        });
    }

}

angular.module('materialscommons').component('mcAdminInfoProjects', {
    template: require('./mc-admin-info-projects.html'),
    controller: MCAdminInfoProjectsComponentController
});
