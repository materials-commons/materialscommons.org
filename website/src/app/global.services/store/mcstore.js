import MCStoreBus from './mcstorebus';

export class MCStore {
    constructor(initialState) {
        this.store = initialState;
        this.bus = new MCStoreBus();
        this.EVREPLACE = 'EVREPLACE';
        this.EVUPDATE = 'EVUPDATE';
        this.EVREMOVE = 'EVREMOVE';
        this.EVADD = 'EVADD';
        this.knownEvents = [this.EVREPLACE, this.EVUPDATE, this.EVREMOVE, this.EVADD];
    }

    subscribe(event, fn) {
        if (!this._knownEvent(event)) {
            throw new Error(`Unknown Event ${event}`);
        }

        return this.bus.subscribe(event, fn);
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

    replace(fn) {
        this._performStoreAction(this.EVREPLACE, fn);
    }

    _performStoreAction(event, fn) {
        fn(this.store);
        this.bus.fireEvent(event, fn, this.store);
    }

    _knownEvent(event) {
        let i = _.findIndex(this.knownEvents, event);
        return i !== -1;
    }
}