class MCRegService {
    /*@ngInject*/
    constructor(mcbus) {
        this.registry = {};
        this.mcbus = mcbus;
    }

    get(name) {
        if (name in this.registry) {
            return this.registry[name];
        }

        return null;
    }

    set(name, value) {
        this.registry[name] = value;
        this.mcbus.send(name, value);
    }

    clear(name) {
        delete this.registry[name];
        this.mcbus.unregisterEvent(name);
    }

    get current$process() {
        return this.get(MCRegService.CURRENT$PROCESS);
    }

    set current$process(value) {
        this.set(MCRegService.CURRENT$PROCESS, value);
    }

    get current$sample() {
        return this.get(MCRegService.CURRENT$SAMPLE);
    }

    set current$sample(value) {
        this.set(MCRegService.CURRENT$SAMPLE, value);
    }

    get current$project() {
        return this.get(MCRegService.CURRENT$PROJECT);
    }

    set current$project(value) {
        this.set(MCRegService.CURRENT$PROJECT, value);
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

