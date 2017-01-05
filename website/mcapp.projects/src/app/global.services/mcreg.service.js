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
        this.mcbus.register(MCRegService.CURRENT$PROCESS, name, fn);
    }

    unregisterCurrent$process(name) {
        this.mcbus.unregister(MCRegService.CURRENT$PROCESS, name);
    }

    unregisterAllCurrent$process() {
        this.mcbus.unregisterEvent(MCRegService.CURRENT$PROCESS);
    }

    changedCurrent$process() {
        let p = this.get(MCRegService.CURRENT$PROCESS);
        this.mcbus.send(MCRegService.CURRENT$PROCESS, p);
    }

    get current$process() {
        return this.get(MCRegService.CURRENT$PROCESS);
    }

    set current$process(value) {
        this.set(MCRegService.CURRENT$PROCESS, value);
    }

    ///// current$sample /////

    registerCurrent$sample(name, fn) {
        this.mcbus.register(MCRegService.CURRENT$SAMPLE, name, fn);
    }

    unregisterCurrent$sample(name) {
        this.mcbus.unregister(MCRegService.CURRENT$SAMPLE, name);
    }

    unregisterAllCurrent$sample() {
        this.mcbus.unregisterEvent(MCRegService.CURRENT$SAMPLE);
    }

    changedCurrent$sample() {
        let p = this.get(MCRegService.CURRENT$SAMPLE);
        this.mcbus.send(MCRegService.CURRENT$SAMPLE, p);
    }

    get current$sample() {
        return this.get(MCRegService.CURRENT$SAMPLE);
    }

    set current$sample(value) {
        this.set(MCRegService.CURRENT$SAMPLE, value);
    }

    ///// current$project /////

    registerCurrent$project(name, fn) {
        this.mcbus.register(MCRegService.CURRENT$PROJECT, name, fn);
    }

    unregisterCurrent$project(name) {
        this.mcbus.unregister(MCRegService.CURRENT$PROJECT, name);
    }

    unregisterAllCurrent$project() {
        this.mcbus.unregisterEvent(MCRegService.CURRENT$PROJECT);
    }

    changedCurrent$project() {
        let p = this.get(MCRegService.CURRENT$PROJECT);
        this.mcbus.send(MCRegService.CURRENT$PROJECT, p);
    }

    get current$project() {
        return this.get(MCRegService.CURRENT$PROJECT);
    }

    set current$project(value) {
        this.set(MCRegService.CURRENT$PROJECT, value);
    }

    ///// current$experiment /////

    registerCurrent$experiment(name, fn) {
        this.mcbus.register(MCRegService.CURRENT$EXPERIMENT, name, fn);
    }

    unregisterCurrent$experiment(name) {
        this.mcbus.unregister(MCRegService.CURRENT$EXPERIMENT, name);
    }

    unregisterAllCurrent$experiment() {
        this.mcbus.unregisterEvent(MCRegService.CURRENT$EXPERIMENT);
    }

    changedCurrent$experiment() {
        let p = this.get(MCRegService.CURRENT$EXPERIMENT);
        this.mcbus.send(MCRegService.CURRENT$EXPERIMENT, p);
    }

    get current$experiment() {
        return this.get(MCRegService.CURRENT$EXPERIMENT);
    }

    set current$experiment(value) {
        this.set(MCRegService.CURRENT$EXPERIMENT, value);
    }
}

MCRegService.CURRENT$PROCESS = 'CURRENT$PROCESS';
MCRegService.CURRENT$SAMPLE = 'CURRENT$SAMPLE';
MCRegService.CURRENT$PROJECT = 'CURRENT$PROJECT';
MCRegService.CURRENT$EXPERIMENT = 'CURRENT$EXPERIMENT';

angular.module('materialscommons').service('mcreg', MCRegService);

