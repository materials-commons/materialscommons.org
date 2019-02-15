class MCProjectSampleViewContainerComponentController {
    /*@ngInject*/
    constructor(samplesAPI, $stateParams) {
        this.samplesAPI = samplesAPI;
        this.sampleId = $stateParams.sample_id;
        this.state = {
            sample: null,
            curl: {path: this.samplesAPI.getSamplePath(), args: {sample_id: ''}},
        };
    }

    $onInit() {
        this.samplesAPI.getSample(this.sampleId).then(sample => {
            this.state.curl.args.sample_id = sample.id;
            this.state.sample = sample;
        });
    }
}

angular.module('materialscommons').component('mcProjectSampleViewContainer', {
    controller: MCProjectSampleViewContainerComponentController,
    template: `<mc-project-sample-view sample="$ctrl.state.sample" curl="$ctrl.state.curl" ng-if="$ctrl.state.sample"></mc-project-sample-view>`
});