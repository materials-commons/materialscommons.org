class MCProjectSidenavComponentController {
    /*@ngInject*/
    constructor($state, mcprojstore, $timeout, ProjectModel) {
        this.$state = $state;
        this.mcprojstore = mcprojstore;
        this.experiment = null;
        this.$timeout = $timeout;
        this.ProjectModel = ProjectModel;
    }

    $onInit() {
        this.unsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTEXPERIMENT, this.mcprojstore.EVSET, (e) => {
            this.$timeout(() => {
                if (!e) {
                    this.experiment = null;
                    return;
                }

                if (!this.experiment) {
                    this.experiment = angular.copy(e);
                } else if (this.experiment.id !== e.id) {
                    this.experiment = angular.copy(e);
                }
            });
        });

        this.project = this.mcprojstore.currentProject;
    }

    $onDestroy() {
        this.unsubscribe();
    }

    refreshProject() {
        this.ProjectModel.getProjectForCurrentUser(this.project.id).then((p) => this.updateProjectExperiments(p));
    }

    updateProjectExperiments(project) {
        this.mcprojstore.updateCurrentProject((currentProject, transformers) => {
            let transformedExperiments = project.experiments.map(e => transformers.transformExperiment(e));
            project.experiments = _.indexBy(transformedExperiments, 'id');
            project.experimentsFullyLoaded = true;
            return project;
        });
    }
}

angular.module('materialscommons').component('mcProjectSidenav', {
    template: require('./mc-project-sidenav.html'),
    controller: MCProjectSidenavComponentController
});
