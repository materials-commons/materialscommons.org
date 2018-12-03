class MCProjectFilesViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, projectFileTreeAPI, fileTreeDeleteService, $timeout, toast) {
        this.mcStateStore = mcStateStore;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.fileTreeDeleteService = fileTreeDeleteService;
        this.$timeout = $timeout;
        this.toast = toast;

        this.state = {
            project: this.mcStateStore.getState('project'),
            fileTree: this.mcStateStore.getState('project:file-tree'),
            activeDir: null,
        };
    }

    $onInit() {
        if (this.state.fileTree == null) {
            this.projectFileTreeAPI.getProjectRoot(this.state.project.id).then(
                files => {
                    files[0].data.childrenLoaded = true;
                    files[0].expand = true;
                    this.state.fileTree = angular.copy(files);
                    this.state.activeDir = angular.copy(files[0]);
                },
                () => this.toast.error('Unable to retrieve project root')
            );
        }
    }

    handleLoadDir(dir) {
        if (!dir.data.childrenLoaded) {
            this.projectFileTreeAPI.getDirectory(this.state.project.id, dir.data.id).then(
                files => {
                    dir.children = files;
                    dir.active = true;
                    dir.data.childrenLoaded = true;
                    dir.expand = !dir.expand;
                    this.state.fileTree = angular.copy(this.state.fileTree);
                    console.log('setting activeDir to', dir);
                    this.state.activeDir = angular.copy(dir);
                },
                () => this.toast.error('unable to retrieve directory')
            );
        } else {
            dir.active = true;
            dir.expand = !dir.expand;
            this.state.fileTree = angular.copy(this.state.fileTree);
            this.state.activeDir = angular.copy(dir);
        }
    }

    handleDeleteFiles(dir, files) {
        console.log('projectfilesviewcontainer handleDeleteFiles', dir, files);
        P.map(files, file => {
            if (file.otype === 'file') {
                return this.fileTreeDeleteService.deleteFile(this.state.project.id, file.id).then(
                    () => {
                        const i = _.findIndex(dir.children, (f) => f.data.id === file.id);
                        dir.children.splice(i, 1);
                    },
                    (err) => {
                        this.toast.error(`Unable to delete file ${file.name}: ${err.data}`);
                    }
                );
            } else {
                return this.fileTreeDeleteService.deleteDir(this.state.project.id, file.id).then(
                    () => {
                        const i = _.findIndex(dir.children, (f) => f.data.id === file.id);
                        dir.children.splice(i, 1);
                    },
                    err => {
                        this.toast.error(`Unable to delete directory ${file.name}: ${err.data}`);
                    }
                );
            }
        }, {concurrency: 3}).then(
            () => {
                this.$timeout(() => {
                    this.state.fileTree = angular.copy(this.state.fileTree);
                });
            },
            () => null
        );
    }
}

angular.module('materialscommons').component('mcProjectFilesViewContainer', {
    controller: MCProjectFilesViewContainerComponentController,
    template: `<mc-project-files-view root="$ctrl.state.fileTree" 
                        on-load-dir="$ctrl.handleLoadDir(dir)" 
                        on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
                        active-dir="$ctrl.state.activeDir"></mc-project-files-view>`
});