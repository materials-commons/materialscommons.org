class MCRegVars {
    constructor() {}

    static get CURRENT$PROCESS() {
        return 'CURRENT$PROCESS';
    }

    static get CURRENT$SAMPLE() {
        return 'CURRENT$SAMPLE';
    }

    static get CURRENT$PROJECT() {
        return 'CURRENT$PROJECT';
    }

    static get CURRENT$EXPERIMENT() {
        return 'CURRENT$EXPERIMENT';
    }

    static get CURRENT$NODE() {
        return 'CURRENT$NODE';
    }

    static get CURRENT$TASK() {
        return 'CURRENT$TASK';
    }
}

angular.module('materialscommons').service('mcregvars', MCRegVars);

