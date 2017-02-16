class MCCloneProcessSelectSamplesComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.inputSamplesMap = _.indexBy(this.inputSamples, 'id');
        this.outputSamplesMap = _.indexBy(this.outputSamples, 'id');
    }

    showSample(sample) {
        this.mcshow.sampleDialog(sample);
    }

    // sampleToggled checks the doesTransform flag. For
    // processes that perform transformations we have to
    // toggle the state of the sample in both the input
    // and output case. If doesTransform is false this
    // method does nothing.
    sampleToggled(sample) {
        if (!this.doesTransform) {
            return;
        }

        let selectedState = sample.selected;

        let s = this.inputSamplesMap[sample.id];
        s.selected = selectedState;

        s = this.outputSamplesMap[sample.id];
        s.selected = selectedState;
    }
}


angular.module('materialscommons').component('mcCloneProcessSelectSamples', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/services/mc-clone-process-select-samples.html',
    controller: MCCloneProcessSelectSamplesComponentController,
    bindings: {
        title: '@',
        inputSamples: '<',
        outputSamples: '<',
        doesTransform: '@'
    }
});