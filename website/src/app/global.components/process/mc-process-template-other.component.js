class MCProcessTemplateOtherComponentController {
    /*@ngInject*/
    constructor(sampleLinker, processEdit, selectItems, experimentsAPI, toast, $stateParams, navbarOnChange,
                mcprojstore, mcbus) {
        this.sampleLinker = sampleLinker;
        this.processEdit = processEdit;
        this.selectItems = selectItems;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.navbarOnChange = navbarOnChange;
        this.mcprojstore = mcprojstore;
        this.mcbus = mcbus;
    }

    linkFilesToSample(sample, input_files, output_files) {
        this.sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function (linkedFiles) {
            sample = this.processEdit.refreshSample(linkedFiles, sample);
        });
    }

    selectFiles() {
        this.selectItems.fileTree(true).then(
            (selected) => {
                let files = selected.files.map(f => {
                    return {id: f.id, command: 'add'};
                });
                let filesArgs = {
                    template_id: this.process.template_id,
                    files: files,
                    process_id: this.process.id
                };
                this.experimentsAPI.updateProcess(this.projectId, this.experimentId, this.process.id, filesArgs)
                    .then(
                        () => {
                            this.process.files = this.process.files.concat(selected.files);
                            this.mcprojstore.updateCurrentProcess((currentProcess) => {
                                currentProcess.files = this.process.files;
                                return currentProcess;
                            });
                        },
                        () => this.toast.error('Unable to add files')
                    );
            });
    }

    selectSamples() {
        this.selectItems.samplesFromProject(this.projectId, this.experimentId).then(
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
                    template_id: this.process.template_id,
                    samples: samples,
                    process_id: this.process.id
                };

                this.experimentsAPI.updateProcess(this.projectId, this.experimentId, this.process.id, samplesArgs)
                    .then(
                        (p) => {
                            p.files = this.process.files;
                            this.process = p;
                            this.mcprojstore.updateCurrentProcess(() => {
                                return p;
                            }).then(
                                () => {
                                    this.mcbus.send('EDGE$ADD', {samples: samples, process: this.process});
                                }
                            );
                            this.navbarOnChange.fireChange();
                            if (this.onChange) {
                                this.onChange();
                            }
                        },
                        () => this.toast.error('Unable to add samples')
                    );
            }
        );
    }
}

angular.module('materialscommons').component('mcProcessTemplateOther', {
    templateUrl: 'app/global.components/process/mc-process-template-other.html',
    controller: MCProcessTemplateOtherComponentController,
    bindings: {
        process: '<',
        onChange: '&'
    }
});
