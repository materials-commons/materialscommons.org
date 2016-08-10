class MCProcessTemplateOtherComponentController {
    /*@ngInject*/
    constructor(sampleLinker, processEdit, selectItems, experimentsService, toast, $stateParams, navbarOnChange) {
        this.sampleLinker = sampleLinker;
        this.processEdit = processEdit;
        this.selectItems = selectItems;
        this.experimentsService = experimentsService;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.navbarOnChange = navbarOnChange;
    }

    $onInit() {
        //console.log('task = ', this.task);
    }

    linkFilesToSample(sample, input_files, output_files) {
        this.sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function(linkedFiles) {
            sample = this.processEdit.refreshSample(linkedFiles, sample);
        });
    }

    selectFiles() {
        this.selectItems.open('files').then(
            (selected) => {
                let files = selected.files.map(f => { return {id: f.id, command: 'add'}; });
                let filesArgs = {
                    template_id: this.process.template_id,
                    files: files,
                    process_id: this.process.id
                };
                this.experimentsService.updateTaskTemplateFiles(this.projectId, this.experimentId, this.task.id, filesArgs)
                    .then(
                        () => this.process.input_files = selected.files,
                        () => this.toast.error('Unable to add files')
                    );
            });
    }

    selectSamples() {
        this.selectItems.open('samples').then(
            (selected) => {
                let samples = selected.samples.map(s => {
                    return {
                        id: s.id,
                        property_set_id: s.property_set_id,
                        command: 'add'
                    };
                });
                let samplesArgs = {
                    template_id: this.process.template_id,
                    samples: samples,
                    process_id: this.process.id
                };

                this.experimentsService.updateTaskTemplateSamples(this.projectId, this.experimentId, this.task.id, samplesArgs)
                    .then(
                        () => {
                            this.process.input_samples = selected.samples;
                            this.navbarOnChange.fireChange();
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
        process: '<'
    }
});

/*@ngInject*/
//function MCTaskTemplateOtherComponentController2(sampleLinker, processEdit, selectItems) {
//    var ctrl = this;
//    ctrl.linkFilesToSample = linkFilesToSample;
//
//    function linkFilesToSample(sample, input_files, output_files) {
//        sampleLinker.linkFilesToSample(sample, input_files, output_files).then(function(linkedFiles) {
//            sample = processEdit.refreshSample(linkedFiles, sample);
//        });
//    }
//
//    ctrl.selectFiles = () => {
//        selectItems.open('files').then(
//            (selected) => {
//                console.log('selectedFiles', selected);
//            }
//        );
//    };
//
//    ctrl.selectSamples = () => {
//        selectItems.open('samples').then(
//            (selected) => {
//                console.log('selectedSamples', selected);
//            }
//        );
//    };
//}
