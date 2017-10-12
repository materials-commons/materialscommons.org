class MCProjectsListComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.sortOrder = 'name';
    }

    experimentsCount(project) {
        return _.keys(project.experiments).length;
    }

    samplesCount(project) {
        return _.keys(project.samples).length;
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