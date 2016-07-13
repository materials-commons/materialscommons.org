class MCShowSampleComponentController {
    /*@ngInject*/
    constructor($stateParams, samplesService, toast, $mdDialog) {
        this.projectId = $stateParams.project_id;
        this.samplesService = samplesService;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
        this.viewHeight = this.viewHeight ? this.viewHeight : "40vh";
    }

    $onInit() {
        this.samplesService.getProjectSample(this.projectId, this.sampleId)
            .then(
                (sample) => this.sample = sample,
                () => this.toast.error('Unable to retrieve sample')
            )
    }

    showProcess(process) {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-process-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowProcessDialogController,
            bindToController: true,
            locals: {
                process: process
            }
        });
    }
}

class ShowProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcShowSample', {
    templateUrl: 'app/global.components/mc-show-sample.html',
    controller: MCShowSampleComponentController,
    bindings: {
        sampleId: '<',
        viewHeight: '@'
    }
});
