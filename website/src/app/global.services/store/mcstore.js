import MCStoreBus from './mcstorebus';

export default class MCStore {
    constructor(initialState) {
        this.store = initialState;
        this.bus = new MCStoreBus();
        this.EVUPDATE = 'EVUPDATE';
        this.EVREMOVE = 'EVREMOVE';
        this.EVADD = 'EVADD';
        this.knownEvents = [this.EVUPDATE, this.EVREMOVE, this.EVADD];
    }

    subscribe(event, fn) {
        if (!this._knownEvent(event)) {
            throw new Error(`Unknown Event ${event}`);
        }

        return this.bus.subscribe(event, fn);
    }

    _knownEvent(event) {
        return _.findIndex(this.knownEvents, event) !== -1;
    }

    update(fn) {
        this._performStoreAction(this.EVUPDATE, fn);
    }

    remove(fn) {
        this._performStoreAction(this.EVREMOVE, fn);
    }

    add(fn) {
        this._performStoreAction(this.EVADD, fn);
    }

    _performStoreAction(event, fn) {
        fn(this.store);
        this.bus.fireEvent(event, this.store);
    }
}