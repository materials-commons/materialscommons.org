class MCProjectSidenavComponentController {
    /*@ngInject*/
    constructor($state, $window, $timeout, projectFileTreeAPI,
                $mdDialog, mcRouteState, $q, User, sidenavGlobus, $interval, blockUI) {
        this.$state = $state;
        this.$window = $window;
        this.experiment = null;
        this.$timeout = $timeout;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.$mdDialog = $mdDialog;
        this.mcRouteState = mcRouteState;
        this.User = User;
        this.$q = $q;
        this.sidenavGlobus = sidenavGlobus;
        this.$interval = $interval;
        this.blockUI = blockUI;
        this.isAuthenticatedToGlobus = false;

        this.state = {
            project: null,
            experiment: null,
            files: null,
        };
    }

    $onInit() {
        this.isBetaUser = this.User.isBetaUser();
    }

    $onChanges(changes) {
        if (changes.project) {
            this.state.project = angular.copy(changes.project.currentValue);
            console.log('this.state.project', this.state.project);
        }
    }

    loadProjectFiles() {
        if (!this.state.files) {
            return this.projectFileTreeAPI.getProjectRoot(this.state.project.id).then((files) => {
                this.state.files = files;
            });
        } else {
            return this.$q.resolve(null);
        }
    }

    $onDestroy() {
    }

    refreshProject() {
        this.onSync();
    }

    startGlobusDownload() {
        this.sidenavGlobus.globusDownload(this.project)
    }

    setupGlobusUpload() {
        this.sidenavGlobus.globusUpload(this.project);
    }

    modifyShortcuts() {
        this.loadProjectFiles().then(
            () => {
                let dirs = [];
                if (this.state.files[0]) {
                    dirs = this.state.files[0].children.filter(d => d.data.otype === 'directory').map(d => d.data);
                }

                this.$mdDialog.show({
                    templateUrl: 'app/modals/modify-project-shortcuts-dialog.html',
                    controller: ModifyProjectShortcutsDialogController,
                    controllerAs: '$ctrl',
                    bindToController: true,
                    locals: {
                        project: this.state.project,
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
    controller: MCProjectSidenavComponentController,
    bindings: {
        project: '<',
        onSync: '&'
    }
});
