class ProjectFilesViewService {
    /*@ngInject*/
    constructor(gridFiles, fileTreeDeleteService, fileTreeMoveService, toast) {
        this.gridFiles = gridFiles;
        this.fileTreeDeleteService = fileTreeDeleteService;
        this.fileTreeMoveService = fileTreeMoveService;
        this.toast = toast;
    }

    deleteFiles(fileTree, projectId, dir, files) {
        let dirEntry = this.gridFiles.findEntry(fileTree[0], dir.data.id);
        return P.map(files, file => {
            if (file.otype === 'file') {
                return this.fileTreeDeleteService.deleteFile(projectId, file.id).then(
                    () => {
                        const i = _.findIndex(dirEntry.model.children, (f) => f.data.id === file.id);
                        dirEntry.model.children.splice(i, 1);
                    },
                    (err) => {
                        this.toast.error(`Unable to delete file ${file.name}: ${err.data}`);
                    }
                );
            } else {
                return this.fileTreeDeleteService.deleteDir(projectId, file.id).then(
                    () => {
                        const i = _.findIndex(dirEntry.model.children, (f) => f.data.id === file.id);
                        dirEntry.model.children.splice(i, 1);
                    },
                    err => {
                        this.toast.error(`Unable to delete directory ${file.name}: ${err.data}`);
                    }
                );
            }
        }, {concurrency: 3});
    }

    moveFile(projectId, fileTree, dirId, file) {
        let dirEntry = this.gridFiles.findEntry(fileTree[0], dirId);
        const nodePath = dirEntry.getPath();
        const fileDir = nodePath[nodePath.length - 2].model;
        this.fileTreeMoveService.moveFile(projectId, file.data.id, fileDir.data.id, dirId).then(
            () => {
                dirEntry.children.push(file);
                dirEntry.model.children.push(file);
            }
        );
    }

    moveDir(projectId, fileTree, parentId, dir) {
        let dirEntry = this.gridFiles.findEntry(fileTree[0], parentId);
        this.fileTreeMoveService.moveDir(projectId, dir.data.id, parentId).then(
            () => dirEntry.children.push(dir)
        );
    }
}

angular.module('materialscommons').service('projectFilesViewService', ProjectFilesViewService);