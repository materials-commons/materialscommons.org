class MCAdminInfoProjectsComponentController {
    /*@ngInject*/
    constructor(projectsAPIForAdmin, toast) {
        console.log("Constructor - MCAdminInfoProjectsComponentController");
        this.projectsAPIForAdmin = projectsAPIForAdmin;
        this.toast = toast;
        this.projectsCount = 0;
        this.allProjects = [];
        this.projectsUserCount = {}
        this.projectsUserList = []
    }

    $onInit() {
        console.log("Init - MCAdminInfoProjectsComponentController");
        this.projectsAPIForAdmin.getProjectsForAdmin().then(
            (projects_list) => {
                this.allProjects = projects_list;
                this.projectsCount = projects_list.length;
                for (let i = 0; i < projects_list.length; i++) {
                    let owner = projects_list[i].owner;
                    if (!this.projectsUserCount.hasOwnProperty(owner)) {
                        this.projectsUserCount[owner] = 0;
                        this.projectsUserList.push(owner);
                    } else {
                        this.projectsUserCount[owner] += 1;
                    }
                }
        });
    }

}

angular.module('materialscommons').component('mcAdminInfoProjects', {
    template: require('./mc-admin-info-projects.html'),
    controller: MCAdminInfoProjectsComponentController
});
