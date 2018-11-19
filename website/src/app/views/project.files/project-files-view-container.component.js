class MCProjectFilesViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, projectFileTreeAPI, toast) {
        this.mcStateStore = mcStateStore;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.toast = toast;

        this.state = {
            project: this.mcStateStore.getState('project'),
            fileTree: this.mcStateStore.getState('project:file-tree'),
        }
    }

    $onInit() {
        if (this.state.fileTree == null) {
            this.projectFileTreeAPI.getProjectRoot(this.state.project.id).then(
                (files) => {
                    console.log('files', files);
                    files[0].data.childrenLoaded = true;
                    files[0].expand = true;
                    this.state.fileTree = files;
                    this.mcStateStore.updateState('project:file-tree', this.state.fileTree);
                },
                () => this.toast.error('Unable to retrieve project files')
            );
        }
    }
}

angular.module('materialscommons').component('mcProjectFilesViewContainer', {
    controller: MCProjectFilesViewContainerComponentController,
    template: `<mc-project-files-view root="$ctrl.state.fileTree"></mc-project-files-view>`
});