class MCProjectSidenavComponentController {
    /*@ngInject*/
    constructor($state, mcprojstore, $timeout, ProjectModel, projectFileTreeAPI) {
        this.$state = $state;
        this.mcprojstore = mcprojstore;
        this.experiment = null;
        this.$timeout = $timeout;
        this.ProjectModel = ProjectModel;
        this.projectFileTreeAPI = projectFileTreeAPI;
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
        if (!this.project.files) {
            this.projectFileTreeAPI.getProjectRoot(this.project.id).then((files) => {
                this.mcprojstore.updateCurrentProject(currentProject => {
                    this.project.files = files;
                    currentProject.files = this.project.files;
                    return currentProject;
                }).then(
                    () => this.createShortcuts()
                );
            });
        } else {
            this.createShortcuts();
        }
    }

    $onDestroy() {
        this.unsubscribe();
    }

    createShortcuts() {
        this.projectDir = this.project.files[0].data;
        this.shortcuts = this.project.files[0].children.filter(f => {
            if (f.data.otype !== 'directory') {
                // Only look at directories
                return false;
            }
            switch (f.data.name) {
                case 'Literature':
                    return true;
                case 'Presentations':
                    return true;
                case 'Project Documents':
                    return true;
                default:
                    return false;
            }
        }).map(f => f.data);
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
