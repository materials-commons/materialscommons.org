class CurrentExperiment {
    constructor() {
        this.currentExperiment = null;
    }

    get() {
        return this.currentExperiment;
    }

    set(experiment) {
        this.currentExperiment = experiment;
    }
}

angular.module('materialscommons').service('currentExperiment', CurrentExperiment);

