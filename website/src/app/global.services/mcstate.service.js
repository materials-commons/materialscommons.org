class MCStateService {
    /*@ngInject*/
    constructor(mcbus) {
        this.registry = {};
        this.mcbus = mcbus;
    }

    get(name) {
        if (this.registry.hasOwnProperty(name)) {
            return this.registry[name];
        }

        return null;
    }

    set(name, value) {
        this.registry[name] = value;
        this.mcbus.send(name, value);
    }

    clear(name) {
        if (this.register.hasOwnProperty(name)) {
            delete this.registry[name];
            this.mcbus.leaveEvent(name);
        }
    }

    subscribe(varname, name, fn) {
        this.mcbus.subscribe(varname, name, fn);
    }

    leave(varname, name) {
        this.mcbus.leave(varname, name);
    }

    changed(varname) {
        let value = this.get(varname);
        this.mcbus.send(varname, value);
    }

    ///// Variable name accessors /////

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

    /**
     *
     */
    get SELECTED$PROCESS() {
        return this.constructor.SELECTED$PROCESS;
    }
}

MCStateService.CURRENT$PROCESS = 'CURRENT$PROCESS';
MCStateService.CURRENT$SAMPLE = 'CURRENT$SAMPLE';
MCStateService.CURRENT$PROJECT = 'CURRENT$PROJECT';
MCStateService.CURRENT$EXPERIMENT = 'CURRENT$EXPERIMENT';
MCStateService.CURRENT$NODE = 'CURRENT$NODE';
MCStateService.CURRENT$TASK = 'CURRENT$TASK';
MCStateService.SELECTED$PROCESS = 'SELECTED$PROCESS';

angular.module('materialscommons').service('mcstate', MCStateService);

