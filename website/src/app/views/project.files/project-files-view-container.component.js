class MCProjectFilesViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, projectFileTreeAPI, projectFilesViewService, gridFiles, $timeout, toast) {
        this.mcStateStore = mcStateStore;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.projectFilesViewService = projectFilesViewService;
        this.gridFiles = gridFiles;
        this.$timeout = $timeout;
        this.toast = toast;

        this.state = {
            project: this.mcStateStore.getState('project'),
            fileTree: this.mcStateStore.getState('project:file-tree'),
            activeDir: null,
            show: true,
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
        this.projectFilesViewService.deleteFiles(this.state.fileTree, this.state.project.id, dir, files).then(
            () => {
                this.$timeout(() => {
                    this.state.fileTree = angular.copy(this.state.fileTree);
                    this.state.activeDir = angular.copy(dirEntry.model);
                    this.state.show = !this.state.show;
                });
            },
            () => null
        );
    }

    handleFinishFilesUpload(dir, files) {
        let dirEntry = this.gridFiles.findEntry(this.state.fileTree[0], dir.data.id);
        //let treeModel = new TreeModel();
        files.forEach(f => {
            let file = this.gridFiles.createFileEntry(f);
            dirEntry.children.push(file);
            //let parsed = treeModel.parse(file);
            //dirEntry.addChild(parsed);
            dirEntry.model.children.push(file);
        });

        this.state.fileTree = angular.copy(this.state.fileTree);
        dirEntry.model.children = _.sortBy(dirEntry.model.children, f => f.data.name);
        // dirEntry.children = _.sortBy(dirEntry.children, f => f.model.data.name);
        // console.log('dirEntry', dirEntry);
        this.state.activeDir = angular.copy(dirEntry.model);
        this.state.show = !this.state.show;
    }

    handleDownloadFiles(files) {
        const fileIds = files.map(f => f.id);
        return this.projectFileTreeAPI.downloadProjectFiles(fileIds);
    }
}

angular.module('materialscommons').component('mcProjectFilesViewContainer', {
    controller: MCProjectFilesViewContainerComponentController,
    // There are two instances of the mc-project-files-view component with a toggle flag ($ctrl.state.show)
    // because there is a recursive directive that needs to be ng-if out/in in order to reload. This allows
    // us to contain that logic in one spot in the container.
    template: `<mc-project-files-view root="$ctrl.state.fileTree" ng-if="$ctrl.state.show"
                        project="$ctrl.state.project"
                        on-load-dir="$ctrl.handleLoadDir(dir)" 
                        on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
                        on-download-files="$ctrl.handleDownloadFiles(files)"
                        on-finish-files-upload="$ctrl.handleFinishFilesUpload(dir, files)"
                        active-dir="$ctrl.state.activeDir"></mc-project-files-view>
                <mc-project-files-view root="$ctrl.state.fileTree" ng-if="!$ctrl.state.show"
                        project="$ctrl.state.project"
                        on-load-dir="$ctrl.handleLoadDir(dir)" 
                        on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
                        on-download-files="$ctrl.handleDownloadFiles(files)"
                        on-finish-files-upload="$ctrl.handleFinishFilesUpload(dir, files)"
                        active-dir="$ctrl.state.activeDir"></mc-project-files-view>`
});