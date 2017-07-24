class MCProcessTemplateSelectService {
    /*@ngInject*/
    constructor(experimentsAPI, selectItems, samplesAPI) {
        this.experimentsAPI = experimentsAPI;
        this.selectItems = selectItems;
        this.samplesAPI = samplesAPI;
    }

    files(projectId, experimentId, process) {
        return this.selectItems.fileTree(true)
            .then(
                selected => {
                    let files = selected.files.map(f => {
                        return {id: f.id, command: 'add'};
                    });
                    return {
                        template_id: process.template_id,
                        files: files,
                        process_id: process.id
                    };

                })
            .then(
                filesArgs => this.experimentsAPI.updateProcess(projectId, experimentId, process.id, filesArgs)
            );
    }

    samples(projectId, experimentId, process, singleSelection = false) {
        this.selectItems.samplesFromProject(projectId, experimentId, {singleSelection})
            .then(
                (selected) => {
                    let samples = selected.samples.map(s => {
                        for (let i = 0; i < s.versions.length; i++) {
                            if (s.versions[i].selected) {
                                return {
                                    id: s.id,
                                    property_set_id: s.versions[i].property_set_id,
                                    command: 'add'
                                };
                            }
                        }
                    });

                    return {
                        template_id: process.template_id,
                        samples: samples,
                        process_id: process.id
                    };
                }
            )
            .then(
                samplesArgs => this.experimentsAPI.updateProcess(this.projectId, this.experimentId, this.process.id, samplesArgs)
            )
    }
}

angular.module('materialscommons').service('mcProcessTemplateSelect', MCProcessTemplateSelectService);