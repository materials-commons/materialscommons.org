class MCDirContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, mcprojstore, gridFiles, projectFileTreeAPI, $state) {
        this.$stateParams = $stateParams;
        this.mcprojstore = mcprojstore;
        this.gridFiles = gridFiles;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.$state = $state;
    }

    $onInit() {
        this.project = this.mcprojstore.currentProject;
        const entry = this.gridFiles.findEntry(this.project.files[0], this.$stateParams.dir_id);
        this.dir = entry.model;
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

    handleDeleteDir() {

    }

    handleUploadFiles() {
        this.$state.go('project.files.uploads2', {directory_id: this.dir.data.id});
    }

    _updateCurrentProj(fn) {
        this.mcprojstore.updateCurrentProject(() => {
            fn();
            return this.project;
        });
    }
}

angular.module('materialscommons').component('mcDirContainer', {
    templateUrl: 'app/project/files/components/dir/mc-dir-container.html',
    controller: MCDirContainerComponentController
});