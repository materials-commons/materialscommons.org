class MCShowSampleComponentController {
    /*@ngInject*/
    constructor($stateParams, samplesService, toast) {
        this.projectId = $stateParams.project_id;
        this.samplesService = samplesService;
        this.toast = toast;
        this.viewHeight = this.viewHeight ? this.viewHeight : "40vh";
    }

    $onInit() {
        if (this.viewHeight) {

        }
        this.samplesService.getProjectSample(this.projectId, this.sampleId)
            .then(
                (sample) => this.sample = sample,
                () => this.toast.error('Unable to retrieve sample')
            )
    }

    gotoProcess(process) {
        console.log('gotoProcess', process);
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
