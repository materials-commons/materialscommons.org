class MCDirContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, mcprojstore, gridFiles, projectFileTreeAPI, fileTreeMoveService, fileTreeDeleteService, $state, $timeout) {
        this.$stateParams = $stateParams;
        this.mcprojstore = mcprojstore;
        this.gridFiles = gridFiles;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.fileTreeMoveService = fileTreeMoveService;
        this.fileTreeDeleteService = fileTreeDeleteService;
        this.$state = $state;
        this.$timeout = $timeout;
    }

    $onInit() {
        this._loadDir();
    }

    _loadDir() {
        this.project = this.mcprojstore.currentProject;
        const entry = this.gridFiles.findEntry(this.project.files[0], this.$stateParams.dir_id);
        this.dir = entry.model;
        console.log('this.dir =', this.dir);
    }

    handleRenameDir(newDirName) {
        this.projectFileTreeAPI.renameProjectDir(this.$stateParams.project_id, this.$stateParams.dir_id, newDirName)
            .then((d) => this._updateCurrentProj(() => {
                this.dir.data.name = newDirName;
                this.dir.data.path = d.path
            }));
    }

    handleCreateDir(createDirName) {
        this.projectFileTreeAPI.createProjectDir(this.$stateParams.project_id, this.$stateParams.dir_id, createDirName).then(
            (d) => {
                let newDir = {
                    data: {
                        id: d.id,
                        name: createDirName,
                        path: d.name, // Returned value for path is in name field
                        otype: 'directory'
                    }
                };
                this._updateCurrentProj(() => this.dir.children.push(newDir));
            }
        );
    }

    handleDelete(items) {
        console.log('handleDelete', items);
        for (let file of items) {
            console.log('file', file);
            this.fileTreeDeleteService.deleteFile(this.$stateParams.project_id, file.id).then(
                () => {
                    const i = _.findIndex(this.dir.children, (f) => f.data.id === file.id);
                    if (i !== -1) {
                        console.log('splicing', i, file.id);
                        this._updateCurrentProj(() => {
                            //this.dir.children = this.dir.children.filter(f => f.data.id !== file.id);
                            this.dir.children.splice(i, 1);
                            console.log('after filter', this.dir);
                        }).then(() => this.$timeout(() => this.dir = []));
                    }
                }
            )
        }
        console.log('handleDelete', items);
    }

    handleUploadFiles() {
        this.$state.go('project.files.uploads2', {directory_id: this.dir.data.id});
    }

    _updateCurrentProj(fn) {
        return this.mcprojstore.updateCurrentProject(() => {
            fn();
            return this.project;
        });
    }

    handleDownloadFiles(files) {
        const fileIds = files.map(f => f.id);
        return this.projectFileTreeAPI.downloadProjectFiles(fileIds);
    }

    handleMove(item) {
        if (this._itemAlreadyInDir(item.data.id)) {
            return false;
        }
        if (item.data.otype === 'file') {
            this._moveFile(item);
        } else {
            this._moveDir(item);
        }
        return true;
    }

    _itemAlreadyInDir(itemId) {
        for (let entry of this.dir.children) {
            if (entry.data.id === itemId) {
                return true;
            }
        }

        return false;
    }

    _moveFile(file) {
        const root = this.fileTreeMoveService.getTreeRoot();
        const node = this.fileTreeMoveService.findNodeByID(root, file.data.id);
        const nodePath = node.getPath();
        const fileDir = nodePath[nodePath.length - 2].model;
        this.fileTreeMoveService.moveFile(file.data.id, fileDir.data.id, this.dir.data.id).then(
            () => this.dir.children.push(file)
        );
    }

    _moveDir(dir) {
        this.fileTreeMoveService.moveDir(dir.data.id, this.dir.data.id).then(
            () => this.dir.children.push(dir)
        );
    }
}

angular.module('materialscommons').component('mcDirContainer', {
    templateUrl: 'app/project/files/components/dir/mc-dir-container.html',
    controller: MCDirContainerComponentController
});