class MCProjectFilesViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, projectFileTreeAPI, toast) {
        this.mcStateStore = mcStateStore;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.toast = toast;

        this.state = {
            project: this.mcStateStore.getState('project'),
            fileTree: this.mcStateStore.getState('project:file-tree'),
        };
    }

    $onInit() {
        if (this.state.fileTree == null) {
            this.projectFileTreeAPI.getProjectRoot(this.state.project.id).then(
                files => {
                    files[0].data.childrenLoaded = true;
                    files[0].expand = true;
                    this.state.fileTree = angular.copy(files);
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
                },
                () => this.toast.error('unable to retrieve directory')
            );
        } else {
            dir.active = true;
            dir.expand = !dir.expand;
            this.state.fileTree = angular.copy(this.state.fileTree);
        }
    }
}

angular.module('materialscommons').component('mcProjectFilesViewContainer', {
    controller: MCProjectFilesViewContainerComponentController,
    template: `<mc-project-files-view root="$ctrl.state.fileTree" on-load-dir="$ctrl.handleLoadDir(dir)"></mc-project-files-view>`
});