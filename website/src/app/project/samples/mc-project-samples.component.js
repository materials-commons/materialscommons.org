class MCProjectSamplesComponentController {
    /*@ngInject*/
    constructor($mdDialog, experimentsService, $stateParams, toast) {
        this.query = '';
        this.showTableView = true;
        this.$mdDialog = $mdDialog;
        this.experimentsService = experimentsService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.toast = toast;
    }

    newSamples() {
        this.experimentsService.createProcessFromTemplate(this.projectId, this.experimentId, 'global_Create Samples')
            .then(
                (process) => {
                    this.$mdDialog.show({
                        templateUrl: 'app/project/samples/new-samples-dialog.html',
                        controllerAs: '$ctrl',
                        controller: NewSamplesDialogController,
                        bindToController: true,
                        locals: {
                            process: process
                        }
                    });
                },
                () => this.toast.error('Unable to add samples')
            );
    }
}

class NewSamplesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        console.log('NewSamplesDialogController', this.process);
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
    templateUrl: 'app/project/samples/mc-project-samples.html',
    controller: MCProjectSamplesComponentController,
    bindings: {
        samples: '='
    }
});


