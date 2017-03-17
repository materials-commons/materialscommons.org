class MCProjectsListComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.sortOrder = 'name';
    }

    showProjectOverview(project) {
        this.mcshow.projectOverviewDialog(project);
    }
}

angular.module('materialscommons').component('mcProjectsList', {
    templateUrl: 'app/components/projects/mc-projects/mc-projects-list.html',
    controller: MCProjectsListComponentController,
    bindings: {
        projects: '<',
        query: '='
    }
});