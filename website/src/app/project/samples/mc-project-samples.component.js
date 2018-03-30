class MCProjectSamplesComponentController {
    /*@ngInject*/
    constructor($mdDialog, experimentsAPI, $stateParams, toast, templates) {
        this.query = '';
        this.showTableView = true;
        this.$mdDialog = $mdDialog;
        this.experimentsAPI = experimentsAPI;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.toast = toast;
        this.templates = templates;
    }

    newSamples() {
        this.experimentsAPI.createProcessFromTemplate(this.projectId, this.experimentId, 'global_Create Samples')
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                    this.$mdDialog.show({
                        templateUrl: 'app/project/samples/new-samples-dialog.html',
                        controllerAs: '$ctrl',
                        controller: NewSamplesDialogController,
                        bindToController: true,
                        locals: {
                            process: p
                        }
                    }).then(
                        () => this.experimentsAPI.getSamplesForExperiment(this.projectId, this.experimentId)
                            .then(
                                (samples) => this.samples = samples,
                                () => this.toast.error('Error retrieving samples for experiment')
                            )
                    );
                },
                () => this.toast.error('Unable to add samples')
            );
    }
}

class NewSamplesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        // log('NewSamplesDialogController', this.process.plain());
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcProjectSamples', {
    template: require('./mc-project-samples.html'),
    controller: MCProjectSamplesComponentController,
    bindings: {
        samples: '='
    }
});


