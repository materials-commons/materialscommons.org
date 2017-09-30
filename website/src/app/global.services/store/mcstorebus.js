export default class MCStoreBus {
    constructor() {
        this.bus = {};
    }

    subscribe(evName, listener) {
        if (!_.isFunction(listener)) {
            throw new Error('Listener must be a function');
        }

        if (!_.has(this.bus, evName)) {
            this.bus[evName] = [];
        }

        this.bus[evName].push(listener);
        return () => {
            const index = this.bus[evName].indexOf(listener);
            if (index !== -1) {
                this.bus[evName].splice(index, 1);
            }
        };
    }

    fireEvent(evName, ...args) {
        if (_.has(this.bus, evName)) {
            this.bus[evName].forEach(fn => fn(...args));
        }
    }
}