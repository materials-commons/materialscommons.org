class MCProjectSidenavComponentController {
    /*@ngInject*/
    constructor($state, mcprojstore, $timeout, ProjectModel, projectFileTreeAPI, $mdDialog) {
        this.$state = $state;
        this.mcprojstore = mcprojstore;
        this.experiment = null;
        this.$timeout = $timeout;
        this.ProjectModel = ProjectModel;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.$mdDialog = $mdDialog;
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
                })
            });
        }
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

    modifyShortcuts() {
        let dirs = [];
        if (this.project.files[0]) {
            dirs = this.project.files[0].children.filter(d => d.data.otype === 'directory').map(d => d.data);
        }

        this.$mdDialog.show({
            templateUrl: 'app/project/home/modify-project-shortcuts-dialog.html',
            controller: ModifyProjectShortcutsDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                project: this.project,
                dirs: dirs
            }
        }).then(
            shortcuts => {

            }
        );
    }
}

class ModifyProjectShortcutsDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectShortcuts) {
        this.$mdDialog = $mdDialog;
        this.defaultShortcuts = projectShortcuts.defaultShortcutPaths(this.project.name);
    }

    done() {
        this.$mdDialog.hide([]);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcProjectSidenav', {
    template: require('./mc-project-sidenav.html'),
    controller: MCProjectSidenavComponentController
});
