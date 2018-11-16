class ProjectShortcutsService {
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
            locals: {
                project: project,
            }
        });
    }
}

class ModifyProjectShortcutsDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectShortcuts, projectsAPI, projectFileTreeAPI) {
        this.$mdDialog = $mdDialog;
        this.projectShortcuts = projectShortcuts;
        this.projectsAPI = projectsAPI;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.state = {
            dirs: [],
            defaultShortcuts: [],
            otherDirs: [],
            dirsMap: {},
        };

        this.loadProjectDirs();
    }

    loadProjectDirs() {
        this.projectFileTreeAPI.getProjectRoot(this.project.id).then((files) => {
            this.state.dirs = files[0].children.filter(d => d.data.otype === 'directory').map(d => d.data);
            this.state.defaultShortcuts = projectShortcuts.defaultShortcutPaths(this.project.name, this.state.dirs);
            this.state.otherDirs = projectShortcuts.filterExistingDefaults(angular.copy(this.state.dirs));
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
                this.projectFileTreeAPI.createProjectDir(this.project.id, this.project.files[0].data.id, s.name).then(
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

angular.module('materialscommons').service('projectShortcuts', ProjectShortcutsService);