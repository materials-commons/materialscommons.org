class WVCService {
    /*@ngInject*/
    constructor(selectItems, experimentsAPI, toast) {
        this.selectItems = selectItems;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
    }

    selectFiles(projectId, experimentId, process) {
        return this.selectItems.fileTreeForProject(projectId, true).then(
            (selected) => {
                let files = selected.files.map(f => {
                    return {id: f.id, command: 'add'};
                });
                let filesArgs = {
                    template_id: process.template_id,
                    files: files,
                    process_id: process.id
                };
                this.experimentsAPI.updateProcess(projectId, experimentId, process.id, filesArgs)
                    .then(
                        () => selected.files,
                        () => this.toast.error('Unable to add files')
                    );
            });
    }
}

angular.module('materialscommons').service('wvcService', WVCService);