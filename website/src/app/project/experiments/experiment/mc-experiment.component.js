class MCExperimentComponentController {
    /*@ngInject*/
    constructor(mcStateStore) {
        this.mcStateStore = mcStateStore;
    }

    $onChanges(changes) {
        if (changes.experiment) {
            // Update mcStateStore in component. This gets fired after other components in route
            // having been set up. That means other components that are doing a mcStoreStore.subscribe()
            // on experiment will have run their $onInit methods before this updateState call, so they
            // will get the experiment. If we do the update outside of the component then it runs before
            // components are setup.
            this.mcStateStore.updateState('experiment', changes.experiment.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcExperiment', {
    template: require('./mc-experiment.html'),
    controller: MCExperimentComponentController,
    bindings: {
        experiment: '<'
    }
});
