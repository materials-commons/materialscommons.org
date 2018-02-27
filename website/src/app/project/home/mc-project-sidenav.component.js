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
        //console.log(this.project);
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
                console.log('shortcuts', shortcuts);
            }
        );
    }
}

class ModifyProjectShortcutsDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectShortcuts, projectsAPI, projectFileTreeAPI) {
        this.$mdDialog = $mdDialog;
        this.projectsAPI = projectsAPI;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.defaultShortcuts = projectShortcuts.defaultShortcutPaths(this.project.name, this.dirs);
        this.otherDirs = projectShortcuts.filterExistingDefaults(angular.copy(this.dirs));
        this.dirsMap = _.indexBy(this.dirs, 'path');
    }

    done() {
        this.defaultShortcuts.forEach(s => {
            if (s.path in this.dirsMap) {
                const d = this.dirsMap[s.path];
                if (s.shortcut && !d.shortcut) {
                    this.projectsAPI.createShortcut(this.project.id, d.id);
                } else if (!s.shortcut && d.shortcut) {
                    this.projectsAPI.deleteShortcut(this.project.id, d.id);
                }
            } else if (s.shortcut) {
                this.projectFileTreeAPI.createProjectDir(this.project.id, this.project.files[0].data.id, s.name).then(
                    (dir) => {
                        this.projectsAPI.createShortcut(this.project.id, dir.id);
                    }
                );
            }
        });
        this.otherDirs.forEach(dir => {
            const d = this.dirsMap[dir.path];
            if (dir.shortcut && !d.shortcut) {
                this.projectsAPI.createShortcut(this.project.id, dir.id);
            } else if (!dir.shortcut && d.shortcut) {
                this.projectsAPI.deleteShortcut(this.project.id, dir.id);
            }
        });
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
