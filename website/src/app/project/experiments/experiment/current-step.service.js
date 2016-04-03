class CurrentStep {
    constructor() {
        this.currentStep = null;
    }

    get() {
        return this.currentStep;
    }

    set(step) {
        this.currentStep = step;
    }
}

angular.module('materialscommons').service('currentStep', CurrentStep);
