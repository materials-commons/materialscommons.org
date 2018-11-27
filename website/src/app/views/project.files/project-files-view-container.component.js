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
        console.log('this.state.project', this.state.project);
        if (this.state.fileTree == null) {
            this.projectFileTreeAPI.getProjectRoot(this.state.project.id).then(
                files => {
                    files[0].data.childrenLoaded = true;
                    files[0].expand = true;
                    this.state.fileTree = angular.copy(files);
                    console.log('this.state.fileTree', this.state.fileTree);
                },
                () => this.toast.error('Unable to retrieve project root')
            );
        }
    }

    handleLoadDir(node) {
        this.projectFileTreeAPI.getDirectory(this.state.project.id, dirId).then(
            files => {
                console.log('projectFileTreeAPI.getDirectory', files);
                file.children = files;
                file.active = true;
                file.data.childrenLoaded = true;
                file.expand = !file.expand;
            },
            () => this.toast.error('unable to retrieve directory')
        );
    }
}

angular.module('materialscommons').component('mcProjectFilesViewContainer', {
    controller: MCProjectFilesViewContainerComponentController,
    template: `<mc-project-files-view root="$ctrl.state.fileTree"></mc-project-files-view>`
});