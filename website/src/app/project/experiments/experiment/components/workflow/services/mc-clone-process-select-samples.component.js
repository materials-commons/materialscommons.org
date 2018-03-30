class MCCloneProcessSelectSamplesComponentController {
    /*@ngInject*/
    constructor(mcshow, selectItems) {
        this.mcshow = mcshow;
        this.selectItems = selectItems;
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

    selectProjectSamples() {
        this.selectItems.samplesFromProject(this.projectId, true).then(
            (selected) => {
                selected.samples.forEach(s => {
                    s.selected = true;
                    s.versions.filter(v => v.selected).forEach(s2 => {
                        s.property_set_id = s2.property_set_id;
                        s.process_id = s2.process_id;
                        this.inputSamples.push(s);
                    });
                });
                this.inputSamplesMap = _.indexBy(this.inputSamples, 'id');
            }
        );
    }
}


angular.module('materialscommons').component('mcCloneProcessSelectSamples', {
    template: require('./mc-clone-process-select-samples.html'),
    controller: MCCloneProcessSelectSamplesComponentController,
    bindings: {
        title: '@',
        inputSamples: '<',
        outputSamples: '<',
        projectId: '<',
        doesTransform: '@'
    }
});
