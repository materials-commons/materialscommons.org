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
                return this.experimentsAPI.updateProcess(projectId, experimentId, process.id, filesArgs)
                    .then(
                        () => selected.files,
                        () => this.toast.error('Unable to add files')
                    );
            });
    }

    selectSamples(projectId, experimentId, process) {
        return this.selectItems.samplesFromProject(projectId, experimentId).then(
            (selected) => {
                let samples = selected.samples.map(s => {
                    for (let i = 0; i < s.versions.length; i++) {
                        if (s.versions[i].selected) {
                            return {
                                id: s.id,
                                property_set_id: s.versions[i].property_set_id,
                                command: 'add',
                                name: s.name
                            };
                        }
                    }
                });
                let samplesArgs = {
                    template_id: process.template_id,
                    samples: samples,
                    process_id: process.id
                };

                return this.experimentsAPI.updateProcess(projectId, experimentId, process.id, samplesArgs)
                    .then(
                        () => samples,
                        // (p) => {
                        // p.files = this.process.files;
                        // this.process = p;
                        // this.mcprojstore.updateCurrentProcess(() => {
                        //     return p;
                        // }).then(
                        //     () => {
                        //         this.mcbus.send('EDGE$ADD', {samples: samples, process: process});
                        //     }
                        // );
                        // this.navbarOnChange.fireChange();
                        // if (this.onChange) {
                        //     this.onChange();
                        // }
                        // },
                        () => this.toast.error('Unable to add samples')
                    );
            }
        );
    }
}

angular.module('materialscommons').service('wvcService', WVCService);