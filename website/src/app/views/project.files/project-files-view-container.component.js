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
        this.projectFileTreeAPI.getDirectoryForProject(this.directoryId, this.state.project.id).then(dir => this.state.activeDir = angular.copy(dir));
    }

    handleChangeDir(path) {
        this.projectFileTreeAPI.getDirectoryByPathForProject(path, this.state.project.id).then(
            (dir) => this.$state.go('project.files', {directory_id: dir.id})
        );
    }

    handleCreateDir(path) {
        this.projectFileTreeAPI.createDirectoryInProject(path, this.state.activeDir.id, this.state.project.id).then(
            dirs => this.state.activeDir = angular.copy(dirs)
        );
    }

    /////////////////////////////////////

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
                        active-dir="$ctrl.state.activeDir"
                        on-change-dir="$ctrl.handleChangeDir(path)" 
                        on-create-dir="$ctrl.handleCreateDir(path)"
                        
                        on-delete-files="$ctrl.handleDeleteFiles(dir, files)"
                        on-download-files="$ctrl.handleDownloadFiles(files)"
                        on-move-file="$ctrl.handleMove(dir, file)"
                        on-rename-dir="$ctrl.handleRenameDir(dir, name)"
                        on-finish-files-upload="$ctrl.handleFinishFilesUpload(dir, files)"></mc-project-files-view2>`
});