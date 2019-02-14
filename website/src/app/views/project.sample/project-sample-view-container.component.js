class MCProjectSampleViewContainerComponentController {
    /*@ngInject*/
    constructor(samplesAPI, $stateParams) {
        this.samplesAPI = samplesAPI;
        this.sampleId = $stateParams.sample_id;
        this.state = {
            sample: null,
        };
    }

    $onInit() {
        this.samplesAPI.getSample(this.sampleId).then(sample => this.state.sample = sample);
    }
}

angular.module('materialscommons').component('mcProjectSampleViewContainer', {
    controller: MCProjectSampleViewContainerComponentController,
    template: `<mc-project-sample-view sample="$ctrl.state.sample" layout-margin ng-if="$ctrl.state.sample"></mc-project-sample-view>`
});