class MCBusService {
    /*@ngInject*/
    constructor() {
        this.bus = {};
    }

    subscribe(event, name, fn) {
        if (!this.bus.hasOwnProperty(event)) {
            this.bus[event] = {};
        }

        this.bus[event][name] = fn;
    }

    leave(event, name) {
        if (!this.bus.hasOwnProperty(event)) {
            return;
        }

        if (!this.bus[event].hasOwnProperty(name)) {
            return;
        }

        delete this.bus[event][name];
    }

    leaveEvent(event) {
        if (this.bus.hasOwnProperty(event)) {
            delete this.bus[event];
        }
    }

    leaveFromAllEvents(name) {
        for (let event in this.bus) {
            if (this.bus.hasOwnProperty(event) && this.bus[event].hasOwnProperty(name)) {
                delete this.bus[event][name];
            }
        }
    }

    send(event, arg) {
        if (this.bus.hasOwnProperty(event)) {
            for (let name in this.bus[event]) {
                let fn = this.bus[event][name];
                fn(arg);
            }
        }
    }

    sendTo(event, name, arg) {
        if (this.bus.hasOwnProperty(event)) {
            for (let n in this.bus[event]) {
                if (n === name) {
                    let fn = this.bus[event][n];
                    fn(arg);
                }
            }
        }
    }
}

angular.module('materialscommons').service('mcbus', MCBusService);
