class ProjectFilesViewService {
    /*@ngInject*/
    constructor(gridFiles, fileTreeDeleteService, toast) {
        this.gridFiles = gridFiles;
        this.fileTreeDeleteService = fileTreeDeleteService;
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

}

angular.module('materialscommons').service('projectFilesViewService', ProjectFilesViewService);