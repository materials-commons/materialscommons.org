class MCProjectFilesViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, projectFileTreeAPI, fileTreeDeleteService, gridFiles, $timeout, toast) {
        this.mcStateStore = mcStateStore;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.fileTreeDeleteService = fileTreeDeleteService;
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
        let dirEntry = this.gridFiles.findEntry(this.state.fileTree[0], dir.data.id);
        P.map(files, file => {
            if (file.otype === 'file') {
                return this.fileTreeDeleteService.deleteFile(this.state.project.id, file.id).then(
                    () => {
                        const i = _.findIndex(dirEntry.model.children, (f) => f.data.id === file.id);
                        dirEntry.model.children.splice(i, 1);
                    },
                    (err) => {
                        this.toast.error(`Unable to delete file ${file.name}: ${err.data}`);
                    }
                );
            } else {
                return this.fileTreeDeleteService.deleteDir(this.state.project.id, file.id).then(
                    () => {
                        const i = _.findIndex(dirEntry.model.children, (f) => f.data.id === file.id);
                        dirEntry.model.children.splice(i, 1);
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
}

angular.module('materialscommons').component('mcProjectFilesViewContainer', {
    controller: MCProjectFilesViewContainerComponentController,
    template: `<mc-project-files-view root="$ctrl.state.fileTree" ng-if="$ctrl.state.show"
                        project="$ctrl.state.project"
                        on-load-dir="$ctrl.handleLoadDir(dir)" 
                        on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
                        on-finish-files-upload="$ctrl.handleFinishFilesUpload(dir, files)"
                        active-dir="$ctrl.state.activeDir"></mc-project-files-view>
                <mc-project-files-view root="$ctrl.state.fileTree" ng-if="!$ctrl.state.show"
                        project="$ctrl.state.project"
                        on-load-dir="$ctrl.handleLoadDir(dir)" 
                        on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
                        on-finish-files-upload="$ctrl.handleFinishFilesUpload(dir, files)"
                        active-dir="$ctrl.state.activeDir"></mc-project-files-view>`
});