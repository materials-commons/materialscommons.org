class MCProjectSidenavComponentController {
    /*@ngInject*/
    constructor($state, mcprojstore, mcprojectstore2, $timeout, ProjectModel, projectFileTreeAPI, $mdDialog, mcRouteState, $q, User) {
        this.$state = $state;
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

    setGlobusDownloadTransfer() {
        console.log("Reached setGlobusDownloadTransfer");
        this.$mdDialog.show({
            templateUrl: 'app/modals/globus-download-transfer-dialog.html',
            controller: GlobusDownloadTransferDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                project: this.project,
            }}
        ).then(((results) =>  console.log("done", results)));
    }

    setGlobusUploadTransfer() {
        console.log("Reached setGlobusUploadTransfer");
        this.$mdDialog.show({
            templateUrl: 'app/modals/globus-upload-transfer-dialog.html',
            controller: GlobusUploadTransferDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                project: this.project,
            }}
        ).then(((results) =>  console.log("done", results)));
    }

    reportGlobusTasks() {
        console.log("Reached reportGlobusTasks");
        this.$mdDialog.show({
            templateUrl: 'app/modals/globus-report-status-dialog.html',
            controller: GlobusReportStatusDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                project: this.project,
            }}
        ).then(((results) =>  console.log("done", results)));
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

class GlobusDownloadTransferDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.requestComplete = false;
        this.globusUser = "username@globus.com";
        this.url = "";
    }

    submitToServer() {
        console.log("Submitting request to server: ", this.project.id, this.globusUser);
        this.etlServerAPI.
            setupGlobusDownloadTransfer(this.project.id, this.globusUser).
            then(globusResults => {
                console.log("Results returned from server: ", globusResults);
                if (globusResults && globusResults.url) {
                    this.url = globusResults.url;
                    this.requestComplete = true;
                }
        });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class GlobusUploadTransferDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.endpoint = '';
    }

    submitToServer() {
        console.log("Submitting request to server: ", this.project.id, this.endpoint);
        this.etlServerAPI.
            setupGlobusUploadTransfer(this.project.id, this.endpoint).
            then(globusResults => {
                console.log("Results returned from server: ", globusResults);
        });
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class GlobusReportStatusDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.statusReportList = [];
        console.log("GlobusReportStatusDialogController - Fetching status");
        this.etlServerAPI.getRecentGlobusStatus(this.project.id).
        then(results => {
            this.statusReportList = results.status_list;
            for (var i = 0; i < this.statusReportList.length; i++) {
                var d = new Date(0);
                d.setUTCSeconds(this.statusReportList[i].timestamp);
                var iso = d.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/);
                this.statusReportList[i].timestamp = iso[1] + ' ' + iso[2];
            }
            console.log(this.statusReportList);
        });
    }

    cancel() {
        this.$mdDialog.cancel();
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
