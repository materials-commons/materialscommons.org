class MCRegService {
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
            this.mcbus.unregisterEvent(name);
        }
    }

    registerName(varname, name, fn) {
        this.mcbus.register(varname, name, fn);
    }

    unregisterName(varname, name) {
        this.mcbus.unregister(varname, name);
    }

    changedName(varname) {
        let value = this.get(varname);
        this.mcbus.send(varname, value);
    }

    ///// current$process /////

    registerCurrent$process(name, fn) {
        this.mcbus.register(this.constructor.CURRENT$PROCESS, name, fn);
    }

    unregisterCurrent$process(name) {
        this.mcbus.unregister(this.constructor.CURRENT$PROCESS, name);
    }

    unregisterAllCurrent$process() {
        this.mcbus.unregisterEvent(this.constructor.CURRENT$PROCESS);
    }

    changedCurrent$process() {
        let p = this.get(this.constructor.CURRENT$PROCESS);
        this.mcbus.send(this.constructor.CURRENT$PROCESS, p);
    }

    get current$process() {
        return this.get(this.constructor.CURRENT$PROCESS);
    }

    set current$process(value) {
        this.set(this.constructor.CURRENT$PROCESS, value);
    }

    ///// current$sample /////

    registerCurrent$sample(name, fn) {
        this.mcbus.register(this.constructor.CURRENT$SAMPLE, name, fn);
    }

    unregisterCurrent$sample(name) {
        this.mcbus.unregister(this.constructor.CURRENT$SAMPLE, name);
    }

    unregisterAllCurrent$sample() {
        this.mcbus.unregisterEvent(this.constructor.CURRENT$SAMPLE);
    }

    changedCurrent$sample() {
        let p = this.get(this.constructor.CURRENT$SAMPLE);
        this.mcbus.send(this.constructor.CURRENT$SAMPLE, p);
    }

    get current$sample() {
        return this.get(this.constructor.CURRENT$SAMPLE);
    }

    set current$sample(value) {
        this.set(this.constructor.CURRENT$SAMPLE, value);
    }

    ///// current$project /////

    registerCurrent$project(name, fn) {
        this.mcbus.register(this.constructor.CURRENT$PROJECT, name, fn);
    }

    unregisterCurrent$project(name) {
        this.mcbus.unregister(this.constructor.CURRENT$PROJECT, name);
    }

    unregisterAllCurrent$project() {
        this.mcbus.unregisterEvent(this.constructor.CURRENT$PROJECT);
    }

    changedCurrent$project() {
        let p = this.get(this.constructor.CURRENT$PROJECT);
        this.mcbus.send(this.constructor.CURRENT$PROJECT, p);
    }

    get current$project() {
        return this.get(this.constructor.CURRENT$PROJECT);
    }

    set current$project(value) {
        this.set(this.constructor.CURRENT$PROJECT, value);
    }

    ///// current$experiment /////

    registerCurrent$experiment(name, fn) {
        this.mcbus.register(this.constructor.CURRENT$EXPERIMENT, name, fn);
    }

    unregisterCurrent$experiment(name) {
        this.mcbus.unregister(this.constructor.CURRENT$EXPERIMENT, name);
    }

    unregisterAllCurrent$experiment() {
        this.mcbus.unregisterEvent(this.constructor.CURRENT$EXPERIMENT);
    }

    changedCurrent$experiment() {
        let p = this.get(this.constructor.CURRENT$EXPERIMENT);
        this.mcbus.send(this.constructor.CURRENT$EXPERIMENT, p);
    }

    get current$experiment() {
        return this.get(this.constructor.CURRENT$EXPERIMENT);
    }

    set current$experiment(value) {
        this.set(this.constructor.CURRENT$EXPERIMENT, value);
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
}

MCRegService.CURRENT$PROCESS = 'CURRENT$PROCESS';
MCRegService.CURRENT$SAMPLE = 'CURRENT$SAMPLE';
MCRegService.CURRENT$PROJECT = 'CURRENT$PROJECT';
MCRegService.CURRENT$EXPERIMENT = 'CURRENT$EXPERIMENT';
MCRegService.CURRENT$NODE = 'CURRENT$NODE';
MCRegService.CURRENT$TASK = 'CURRENT$TASK';

angular.module('materialscommons').service('mcreg', MCRegService);

