import MCStoreBus from './mcstorebus';

export const EVTYPE = {
    EVUPDATE: 'EVUPDATE',
    EVREMOVE: 'EVREMOVE',
    EVADD: 'EVADD'
};

const _KNOWN_EVENTS = _.values(EVTYPE);

function isKnownEvent(event) {
    return _KNOWN_EVENTS.indexOf(event) !== -1;
}

export class MCStore {
    constructor(name, initialState) {
        this.store = initialState;
        window.sessionStorage.setItem(name, angular.toJson(this.store));
        this.name = name;
        this.loaded = false;
        this.bus = new MCStoreBus();
        this.EVUPDATE = 'EVUPDATE';
        this.EVREMOVE = 'EVREMOVE';
        this.EVADD = 'EVADD';
        this.knownEvents = [this.EVUPDATE, this.EVREMOVE, this.EVADD];
    }

    subscribe(event, fn) {
        if (!isKnownEvent(event)) {
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

    _performStoreAction(event, fn) {
        this.set(fn);
        this.bus.fireEvent(event, this.store);
    }

    getStore() {
        this._ensureStoreLoaded();
        return this.store;
    }

    // Sets a value in the store without firing actions
    set(fn) {
        this._ensureStoreLoaded();
        fn(this.store);
        window.sessionStorage.setItem(this.name, angular.toJson(this.store));
    }

    _ensureStoreLoaded() {
        if (!this.loaded) {
            this.store = angular.fromJson(window.sessionStorage.getItem(this.name));
            this.loaded = true;
        }
    }
}