class MCCloneProcessSelectFilesComponentController {
    /*@ngInject*/
    constructor(mcshow, selectItems, projectsAPI) {
        this.mcshow = mcshow;
        this.selectItems = selectItems;
        this.projectsAPI = projectsAPI;
    }

    showFile(file) {
        this.mcshow.showFile(file);
    }

    selectProjectFiles() {
        this.selectItems.fileTree(true).then(
            (selected) => {
                selected.files.forEach(f => {
                    if (!f.name) {
                        // If f.name doesn't exist then retrieve the file so the name can be shown
                        // in the UI list of files.
                        this.projectsAPI.getProjectFile(this.projectId, f.id).then(
                            (file) => {
                                file.selected = true;
                                this.files.push(file);
                            }
                        );
                    } else {
                        f.selected = true;
                        this.files.push(f);
                    }
                });
            }
        );
    }
}

angular.module('materialscommons').component('mcCloneProcessSelectFiles', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/services/mc-clone-process-select-files.html',
    controller: MCCloneProcessSelectFilesComponentController,
    bindings: {
        projectId: '<',
        files: '='
    }
});
