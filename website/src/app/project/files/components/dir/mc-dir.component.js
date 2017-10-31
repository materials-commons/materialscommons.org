class MCDirComponentController {
    /*@ngInject*/
    constructor($stateParams, mcprojstore, gridFiles, mcFileOpsDialogs, projectFileTreeAPI) {
        this.dirId = $stateParams.dir_id;
        this.projectId = $stateParams.project_id;
        this.mcprojstore = mcprojstore;
        this.gridFiles = gridFiles;
        this.mcFileOpsDialogs = mcFileOpsDialogs;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.selected = false;
    }

    $onInit() {
        const project = this.mcprojstore.currentProject;
        const entry = this.gridFiles.findEntry(project.files[0], this.dirId);
        console.log('entry', entry);
        if (entry) {
            this.dir = entry.model;
        }
    }

    onSelected(selected) {
        this.selected = selected;
    }

    renameDirectory() {
        console.log('renameDirectory');
        this.mcFileOpsDialogs.renameDirectory(this.dir).then(
            name => {
                this.projectFileTreeAPI.renameProjectDir(this.projectId, this.dirId, name)
                    .then(
                        () => {
                            this.mcprojstore.updateCurrentProject(proj => {
                                // this.dir points inside of proj
                                this.dir.data.name = name;
                                return proj;
                            });
                        }
                    );
            }
        );
    }
}

// projectFileTreeAPI.renameProjectDir(ctrl.projectId, ctrl.file.data.id, ctrl.file.data.name)
//           .then(
angular.module('materialscommons').component('mcDir', {
    templateUrl: 'app/project/files/components/dir/mc-dir.html',
    controller: MCDirComponentController
});