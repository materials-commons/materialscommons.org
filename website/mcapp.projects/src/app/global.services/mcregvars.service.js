class MCRegVars {
    constructor() {
    }

    /**
     *
     * @returns {string}
     * @constructor
     */
    get CURRENT$PROCESS() {
        return this.constructor.CURRENT$PROCESS;
    }

    /**
     *
     * @returns {string}
     * @constructor
     */
    get CURRENT$SAMPLE() {
        return this.constructor.CURRENT$SAMPLE;
    }

    /**
     *
     * @returns {string}
     * @constructor
     */
    get CURRENT$PROJECT() {
        return this.constructor.CURRENT$PROJECT;
    }

    /**
     *
     * @returns {string}
     * @constructor
     */
    get CURRENT$EXPERIMENT() {
        return this.constructor.CURRENT$EXPERIMENT;
    }

    /**
     *
     * @returns {string}
     * @constructor
     */
    get CURRENT$NODE() {
        return this.constructor.CURRENT$NODE;
    }

    /**
     *
     * @returns {string}
     * @constructor
     */
    get CURRENT$TASK() {
        return this.constructor.CURRENT$TASK;
    }
}

MCRegVars.CURRENT$PROCESS = 'CURRENT$PROCESS';
MCRegVars.CURRENT$SAMPLE = 'CURRENT$SAMPLE';
MCRegVars.CURRENT$PROJECT = 'CURRENT$PROJECT';
MCRegVars.CURRENT$EXPERIMENT = 'CURRENT$EXPERIMENT';
MCRegVars.CURRENT$NODE = 'CURRENT$NODE';
MCRegVars.CURRENT$TASK = 'CURRENT$TASK';

angular.module('materialscommons').service('mcregvars', MCRegVars);

