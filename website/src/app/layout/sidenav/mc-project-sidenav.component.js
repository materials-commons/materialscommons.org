class MCProjectSidenavComponentController {
    /*@ngInject*/
    constructor($state, $window, mcprojstore, mcprojectstore2, $timeout, ProjectModel, projectFileTreeAPI,
                $mdDialog, mcRouteState, $q, User, sidenavGlobus, $interval, blockUI) {
        this.$state = $state;
        this.$window = $window;
        this.mcprojstore = mcprojstore;
        this.mcprojectstore2 = mcprojectstore2;
        this.experiment = null;
        this.$timeout = $timeout;
        this.ProjectModel = ProjectModel;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.$mdDialog = $mdDialog;
        this.mcRouteState = mcRouteState;
        this.User = User;
        this.$q = $q;
        this.sidenavGlobus = sidenavGlobus;
        this.$interval = $interval;
        this.blockUI = blockUI;
        this.isAuthenticatedToGlobus = false;
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
        this.isBetaUser = this.User.isBetaUser();
        this.sidenavGlobus.isAuthenticated().then(authStatus => this.isAuthenticatedToGlobus = authStatus);
    }

    loadProjectFiles() {
        if (!this.project.files) {
            return this.projectFileTreeAPI.getProjectRoot(this.project.id).then((files) => {
                return this.mcprojstore.updateCurrentProject(currentProject => {
                    this.project.files = files;
                    currentProject.files = this.project.files;
                    return currentProject;
                });
            });
        } else {
            return this.$q.resolve(null);
        }
    }

    $onDestroy() {
        this.unsubscribe();
    }

    refreshProject() {
        this.mcprojectstore2.reloadProject(this.project.id);
        this.ProjectModel.getProjectForCurrentUser(this.project.id).then((p) => this._updateProject(p));
    }

    startGlobusDownloadTransfer() {
        this.sidenavGlobus.globusDownload(this.project)
    }

    showGlobusTasks() {
        this.sidenavGlobus.showGlobusTasks(this.project);
    }

    startGlobusTransfer() {
        this.sidenavGlobus.globusUpload(this.project);
    }

    abortGlobusTasks() {
        this.sidenavGlobus.globusAbortTasks(this.project);
    }

    loginToGlobus() {
        this.sidenavGlobus.loginToGlobus().then(() => this._checkGlobusAuthStatus());
    }

    logoutFromGlobus() {
        this.sidenavGlobus.logoutFromGlobus().then(() => this._checkGlobusAuthStatus());
    }

    _checkGlobusAuthStatus() {
        let promise = null;
        this.blockUI.stop();
        promise = this.$interval(() => {
            this.blockUI.stop();
            this.sidenavGlobus.isAuthenticated().then(authStatus => {
                console.log(`${this.isAuthenticatedToGlobus}/${authStatus}`);
                // check if we are logging out
                if (this.isAuthenticatedToGlobus && !authStatus) {
                    this.isAuthenticatedToGlobus = authStatus;
                    this.$interval.cancel(promise);
                } else if (!this.isAuthenticatedToGlobus && authStatus) {
                    this.isAuthenticatedToGlobus = authStatus;
                    this.$interval.cancel(promise);
                }
            });
        }, 2000, 2);
    }



    _updateProject(project) {
        this.mcprojstore.updateCurrentProject((currentProject, transformers) => {
            let transformedExperiments = project.experiments.map(e => transformers.transformExperiment(e));
            project.experiments = _.indexBy(transformedExperiments, 'id');
            project.experimentsFullyLoaded = true;
            this.project = project;
            return project;
        }).then(
            () => {
                if (!this.project.files) {
                    this.projectFileTreeAPI.getProjectRoot(this.project.id).then((files) => {
                        this.mcprojstore.updateCurrentProject(currentProject => {
                            this.project.files = files;
                            currentProject.files = this.project.files;
                            return currentProject;
                        });
                    });
                }
            }
        );
    }

    modifyShortcuts() {
        this.loadProjectFiles().then(
            () => {
                let dirs = [];
                if (this.project.files[0]) {
                    dirs = this.project.files[0].children.filter(d => d.data.otype === 'directory').map(d => d.data);
                }

                this.$mdDialog.show({
                    templateUrl: 'app/modals/modify-project-shortcuts-dialog.html',
                    controller: ModifyProjectShortcutsDialogController,
                    controllerAs: '$ctrl',
                    bindToController: true,
                    locals: {
                        project: this.project,
                        dirs: dirs
                    }
                }).then(
                    () => this.refreshProject()
                );
            });
    }

    isDatasetsRoute() {
        return this.mcRouteState.getRouteName().startsWith('project.experiment.datasets');
    }

    isProjectDatasetsRoute() {
        return this.mcRouteState.getRouteName().startsWith('project.datasets');
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
                if (s.shortcut) {
                    this.projectsAPI.createShortcut(this.project.id, d.id);
                } else if (!s.shortcut) {
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
            if (dir.shortcut) {
                this.projectsAPI.createShortcut(this.project.id, dir.id);
            } else if (!dir.shortcut) {
                this.projectsAPI.deleteShortcut(this.project.id, dir.id);
            }
        });
        let defaultShortcuts = this.defaultShortcuts.filter(s => s.shortcut);
        let dirShortcuts = this.otherDirs.filter(d => d.shortcut);
        let allShortcuts = defaultShortcuts.concat(dirShortcuts);
        this.$mdDialog.hide(allShortcuts);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcProjectSidenav', {
    template: require('./mc-project-sidenav.html'),
    controller: MCProjectSidenavComponentController
});
