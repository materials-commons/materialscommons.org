class MCShowSampleComponentController {
    /*@ngInject*/
    constructor($stateParams, samplesService, toast) {
        this.projectId = $stateParams.project_id;
        this.samplesService = samplesService;
        this.toast = toast;
    }

    $onInit() {
        this.samplesService.getProjectSample(this.projectId, this.sample.id)
            .then(
                (sample) => console.log('retrieved sample', sample.plain()),
                () => this.toast.error('Unable to retrieve sample')
            )
    }
}

angular.module('materialscommons').component('mcShowSample', {
    templateUrl: 'app/global.components/mc-show-sample.html',
    controller: MCShowSampleComponentController,
    bindings: {
        sample: '<'
    }
});
