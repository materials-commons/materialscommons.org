class MCProjectFilesViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, projectFileTreeAPI, projectFilesViewService, gridFiles, $timeout, toast, $stateParams, $state) {
        this.mcStateStore = mcStateStore;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.projectFilesViewService = projectFilesViewService;
        this.gridFiles = gridFiles;
        this.$timeout = $timeout;
        this.toast = toast;
        this.$state = $state;
        this.directoryId = $stateParams.directory_id ? $stateParams.directory_id : 'root';

        this.state = {
            project: this.mcStateStore.getState('project'),
            activeDir: null,
            show: true,
        };
    }

    $onInit() {
        if (this.state.fileTree == null) {
            this.projectFileTreeAPI.getDirectoryForProject(this.directoryId, this.state.project.id).then(
                dir => {
                    this.state.activeDir = angular.copy(dir);
                },
                () => this.toast.error('Unable to retrieve project root')
            );
        }
    }

    handleChangeDir(path) {
        this.projectFileTreeAPI.getDirectoryByPathForProject(path, this.state.project.id).then(
            (dir) => this.$state.go('project.files', {directory_id: dir.id})
        );
    }

    handleDeleteFiles(dir, files) {
        let dirEntry = this.gridFiles.findEntry(this.state.fileTree[0], dir.data.id);
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
        files.forEach(f => {
            let file = this.gridFiles.createFileEntry(f);
            dirEntry.children.push(file);
            dirEntry.model.children.push(file);
        });

        this.state.fileTree = angular.copy(this.state.fileTree);
        dirEntry.model.children = _.sortBy(dirEntry.model.children, f => f.data.name);
        this.state.activeDir = angular.copy(dirEntry.model);
        this.state.show = !this.state.show;
    }

    handleDownloadFiles(files) {
        const fileIds = files.map(f => f.id);
        return this.projectFileTreeAPI.downloadProjectFiles(fileIds);
    }

    handleMove(dir, file) {
        if (this.alreadyInDir(dir, file)) {
            return false;
        }

        let projectId = this.state.project.id;

        if (file.data.otype === 'file') {
            this.projectFilesViewService.moveFile(projectId, this.state.fileTree, dir.data.id, file);
        } else {
            this.projectFilesViewService.moveDir(projectId, this.state.fileTree, dir.data.id, file);
        }

        return true;
    }

    alreadyInDir(dir, itemId) {
        for (let entry of dir.children) {
            if (entry.data.id === itemId) {
                return true;
            }
        }
        return false;
    }

    handleCreateDir(parent, name) {
        let dirEntry = this.gridFiles.findEntry(this.state.fileTree[0], parent.data.id);
        this.projectFileTreeAPI.createProjectDir(this.state.project.id, parent.data.id, name).then(
            d => {
                let newDir = {
                    expanded: false,
                    children: [],
                    data: {
                        id: d.id,
                        name: name,
                        path: d.name, // Returned value for path is in name field
                        otype: 'directory'
                    }
                };
                dirEntry.children.push(newDir);
                this.state.fileTree = angular.copy(this.state.fileTree);
                this.state.activeDir = angular.copy(this.state.activeDir);
            },
            () => this.toast.error('Unable create directory')
        );
    }

    handleRenameDir(dir, name) {
        let dirEntry = this.gridFiles.findEntry(this.state.fileTree[0], dir.data.id);
        this.projectFileTreeAPI.renameProjectDir(this.state.project.id, dir.data.id, name).then(
            d => {
                dirEntry.model.data.name = name;
                dirEntry.model.data.path = d.path;
                this.state.fileTree = angular.copy(this.state.fileTree);
                this.state.activeDir = angular.copy(this.state.activeDir);
            },
            () => this.toast.error('Unable to rename directory')
        );
    }
}

angular.module('materialscommons').component('mcProjectFilesViewContainer', {
    controller: MCProjectFilesViewContainerComponentController,
    // There are two instances of the mc-project-files-view component with a toggle flag ($ctrl.state.show)
    // because there is a recursive directive that needs to be ng-if out/in in order to reload. This allows
    // us to contain that logic in one spot in the container.
    template: `<mc-project-files-view2 
                        on-change-dir="$ctrl.handleChangeDir(path)" 
                        on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
                        on-download-files="$ctrl.handleDownloadFiles(files)"
                        on-move-file="$ctrl.handleMove(dir, file)"
                        on-create-dir="$ctrl.handleCreateDir(parent, name)"
                        on-rename-dir="$ctrl.handleRenameDir(dir, name)"
                        on-finish-files-upload="$ctrl.handleFinishFilesUpload(dir, files)"
                        active-dir="$ctrl.state.activeDir"></mc-project-files-view2>`
    // template: `<mc-project-files-view root="$ctrl.state.fileTree" ng-if="$ctrl.state.show"
    //                     project="$ctrl.state.project"
    //                     on-load-dir="$ctrl.handleLoadDir(dir)"
    //                     on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
    //                     on-download-files="$ctrl.handleDownloadFiles(files)"
    //                     on-move-file="$ctrl.handleMove(dir, file)"
    //                     on-create-dir="$ctrl.handleCreateDir(parent, name)"
    //                     on-rename-dir="$ctrl.handleRenameDir(dir, name)"
    //                     on-finish-files-upload="$ctrl.handleFinishFilesUpload(dir, files)"
    //                     active-dir="$ctrl.state.activeDir"></mc-project-files-view>
    //             <mc-project-files-view root="$ctrl.state.fileTree" ng-if="!$ctrl.state.show"
    //                     project="$ctrl.state.project"
    //                     on-load-dir="$ctrl.handleLoadDir(dir)"
    //                     on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
    //                     on-download-files="$ctrl.handleDownloadFiles(files)"
    //                     on-move-file="$ctrl.handleMove(dir, file)"
    //                     on-create-dir="$ctrl.handleCreateDir(parent, name)"
    //                     on-rename-dir="$ctrl.handleRenameDir(dir, name)"
    //                     on-finish-files-upload="$ctrl.handleFinishFilesUpload(dir, files)"
    //                     active-dir="$ctrl.state.activeDir"></mc-project-files-view>`
});