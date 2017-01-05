class MCRegService {
    /*@ngInject*/
    constructor(mcbus, mcregvars) {
        this.registry = {};
        this.mcbus = mcbus;
        this.mcregvars = mcregvars;
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
        this.mcbus.register(this.mcregvars.CURRENT$PROCESS, name, fn);
    }

    unregisterCurrent$process(name) {
        this.mcbus.unregister(this.mcregvars.CURRENT$PROCESS, name);
    }

    unregisterAllCurrent$process() {
        this.mcbus.unregisterEvent(this.mcregvars.CURRENT$PROCESS);
    }

    changedCurrent$process() {
        let p = this.get(this.mcregvars.CURRENT$PROCESS);
        this.mcbus.send(this.mcregvars.CURRENT$PROCESS, p);
    }

    get current$process() {
        return this.get(this.mcregvars.CURRENT$PROCESS);
    }

    set current$process(value) {
        this.set(this.mcregvars.CURRENT$PROCESS, value);
    }

    ///// current$sample /////

    registerCurrent$sample(name, fn) {
        this.mcbus.register(this.mcregvars.CURRENT$SAMPLE, name, fn);
    }

    unregisterCurrent$sample(name) {
        this.mcbus.unregister(this.mcregvars.CURRENT$SAMPLE, name);
    }

    unregisterAllCurrent$sample() {
        this.mcbus.unregisterEvent(this.mcregvars.CURRENT$SAMPLE);
    }

    changedCurrent$sample() {
        let p = this.get(this.mcregvars.CURRENT$SAMPLE);
        this.mcbus.send(this.mcregvars.CURRENT$SAMPLE, p);
    }

    get current$sample() {
        return this.get(this.mcregvars.CURRENT$SAMPLE);
    }

    set current$sample(value) {
        this.set(this.mcregvars.CURRENT$SAMPLE, value);
    }

    ///// current$project /////

    registerCurrent$project(name, fn) {
        this.mcbus.register(this.mcregvars.CURRENT$PROJECT, name, fn);
    }

    unregisterCurrent$project(name) {
        this.mcbus.unregister(this.mcregvars.CURRENT$PROJECT, name);
    }

    unregisterAllCurrent$project() {
        this.mcbus.unregisterEvent(this.mcregvars.CURRENT$PROJECT);
    }

    changedCurrent$project() {
        let p = this.get(this.mcregvars.CURRENT$PROJECT);
        this.mcbus.send(this.mcregvars.CURRENT$PROJECT, p);
    }

    get current$project() {
        console.log('current$project', this.mcregvars.CURRENT$PROJECT);
        return this.get(this.mcregvars.CURRENT$PROJECT);
    }

    set current$project(value) {
        this.set(this.mcregvars.CURRENT$PROJECT, value);
    }

    ///// current$experiment /////

    registerCurrent$experiment(name, fn) {
        this.mcbus.register(this.mcregvars.CURRENT$EXPERIMENT, name, fn);
    }

    unregisterCurrent$experiment(name) {
        this.mcbus.unregister(this.mcregvars.CURRENT$EXPERIMENT, name);
    }

    unregisterAllCurrent$experiment() {
        this.mcbus.unregisterEvent(this.mcregvars.CURRENT$EXPERIMENT);
    }

    changedCurrent$experiment() {
        let p = this.get(this.mcregvars.CURRENT$EXPERIMENT);
        this.mcbus.send(this.mcregvars.CURRENT$EXPERIMENT, p);
    }

    get current$experiment() {
        return this.get(this.mcregvars.CURRENT$EXPERIMENT);
    }

    set current$experiment(value) {
        console.log('set current$experiment', this.mcregvars.CURRENT$EXPERIMENT);
        this.set(this.mcregvars.CURRENT$EXPERIMENT, value);
    }
}

angular.module('materialscommons').service('mcreg', MCRegService);

