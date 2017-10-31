class MCFileTreeUploaderComponentController {
    /*@ngInject*/
    constructor(mcprojstore, gridFiles, $stateParams) {
        this.mcprojstore = mcprojstore;
        this.gridFiles = gridFiles;
        this.$stateParams = $stateParams;
    }

    $onInit() {
        const project = this.mcprojstore.currentProject;
        this.projectId = this.$stateParams.project_id;
        const entry = this.gridFiles.findEntry(project.files[0], this.$stateParams.directory_id);
        this.dir = entry.model;
    }

    uploadComplete(files) {
        files.forEach(f => {
            this.dir.children.push(this.gridFiles.createFileEntry(f));
        });

        // Update above is updating project entry;
        this.mcprojstore.updateCurrentProject(currentProj => {
            return currentProj;
        });
    }
}

angular.module('materialscommons').component('mcFileTreeUploaderContainer', {
    templateUrl: 'app/project/files/components/mc-file-tree-uploader-container.html',
    controller: MCFileTreeUploaderComponentController,
    bindings: {
        directoryId: '='
    }
});