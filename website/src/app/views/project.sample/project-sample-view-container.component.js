class MCProjectSampleViewContainerComponentController {
    /*@ngInject*/
    constructor(samplesAPI, mcshow, $stateParams) {
        this.samplesAPI = samplesAPI;
        this.mcshow = mcshow;
        this.$stateParams = $stateParams;
        this.state = {
            sample: null,
            curl: {path: this.samplesAPI.getSamplePath(), args: {sample_id: ''}},
        };
    }

    $onInit() {
        this.samplesAPI.getSample(this.$stateParams.sample_id).then(sample => {
            this.state.curl.args.sample_id = sample.id;
            this.state.sample = sample;
        });
    }

    handleShowMeasurements(attr) {
        this.samplesAPI.getSamplePropertyMeasurements(this.$stateParams.project_id, this.$stateParams.sample_id, attr.id).then(
            a => this.mcshow.propertyMeasurementsDialog(a, (attrId, mId) => {
                this.setAsBestMeasure(attrId, mId);
            })
        );
    }

    setAsBestMeasure(attrId, mId) {
        if (mId === '') {
            this.clearBestMeasure(attrId);
        } else {
            this.samplesAPI.setAsBestMeasure(this.$stateParams.project_id, this.$stateParams.sample_id, attrId, mId).then(
                () => {
                    this.samplesAPI.getSample(this.$stateParams.sample_id).then(sample => {
                        this.state.curl.args.sample_id = sample.id;
                        this.state.sample = angular.copy(sample);
                    });
                }
            );
        }
    }

    clearBestMeasure(attrId) {
        this.samplesAPI.clearBestMeasure(this.$stateParams.project_id, this.$stateParams.sample_id, attrId).then(
            () => {
                this.samplesAPI.getSample(this.$stateParams.sample_id).then(sample => {
                    this.state.curl.args.sample_id = sample.id;
                    this.state.sample = angular.copy(sample);
                });
            }
        );
    }
}

angular.module('materialscommons').component('mcProjectSampleViewContainer', {
    controller: MCProjectSampleViewContainerComponentController,
    template: `<mc-project-sample-view sample="$ctrl.state.sample" 
                                       curl="$ctrl.state.curl" 
                                       on-set-as-best-measure="$ctrl.setAsBestMeasure(attrId, mId)"
                                       on-show-measurements="$ctrl.handleShowMeasurements(attr)"
                                       ng-if="$ctrl.state.sample"></mc-project-sample-view>`
});