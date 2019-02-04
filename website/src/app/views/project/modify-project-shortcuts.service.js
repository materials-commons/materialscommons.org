class ModifyProjectShortcutsService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    modifyShortcuts(project) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/modify-project-shortcuts-dialog.html',
            controller: ModifyProjectShortcutsDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                project: project,
            }
        });
    }
}

class ModifyProjectShortcutsDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectsAPI, projectFileTreeAPI) {
        this.$mdDialog = $mdDialog;
        this.projectsAPI = projectsAPI;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.state = {
            dirs: [],
            defaultShortcuts: [],
            otherDirs: [],
            dirsMap: {},
        };

        this._defaultShortcuts = ['Literature', 'Presentations', 'Project Documents'];

        this.loadProjectDirs();
    }

    defaultShortcutPaths(projectName, dirs) {
        let defaultShortcutsNames = this._defaultShortcuts.map(shortcut => ({path: `${projectName}/${shortcut}`, name: shortcut}));
        let dirsMap = _.indexBy(dirs, 'path');
        return defaultShortcutsNames.map(entry => {
            if (entry.path in dirsMap) {
                return dirsMap[entry.path];
            } else {
                return {
                    path: entry.path,
                    name: entry.name,
                    shortcut: false,
                    rootDir: null,
                };
            }
        });
    }

    filterExistingDefaults(dirs) {
        return dirs.filter(d => _.findIndex(this._defaultShortcuts, name => name === d.name) === -1);
    }

    loadProjectDirs() {
        this.projectFileTreeAPI.getProjectRoot(this.project.id).then((files) => {
            this.state.rootDir = files[0].data;
            this.state.dirs = files[0].children.filter(d => d.data.otype === 'directory').map(d => d.data);
            this.state.defaultShortcuts = this.defaultShortcutPaths(this.project.name, this.state.dirs);
            this.state.otherDirs = this.filterExistingDefaults(angular.copy(this.state.dirs));
            this.state.dirsMap = _.indexBy(this.state.dirs, 'path');
        });
    }

    done() {
        this.state.defaultShortcuts.forEach(s => {
            if (s.path in this.state.dirsMap) {
                const d = this.state.dirsMap[s.path];
                if (s.shortcut) {
                    this.projectsAPI.createShortcut(this.project.id, d.id);
                } else if (!s.shortcut) {
                    this.projectsAPI.deleteShortcut(this.project.id, d.id);
                }
            } else if (s.shortcut) {
                this.projectFileTreeAPI.createProjectDir(this.project.id, this.state.rootDir.id, s.name).then(
                    (dir) => {
                        this.projectsAPI.createShortcut(this.project.id, dir.id);
                    }
                );
            }
        });
        this.state.otherDirs.forEach(dir => {
            if (dir.shortcut) {
                this.projectsAPI.createShortcut(this.project.id, dir.id);
            } else if (!dir.shortcut) {
                this.projectsAPI.deleteShortcut(this.project.id, dir.id);
            }
        });
        let defaultShortcuts = this.state.defaultShortcuts.filter(s => s.shortcut);
        let dirShortcuts = this.state.otherDirs.filter(d => d.shortcut);
        let allShortcuts = defaultShortcuts.concat(dirShortcuts);
        this.$mdDialog.hide(allShortcuts);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('modifyProjectShortcuts', ModifyProjectShortcutsService);
