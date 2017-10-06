import MCStoreBus from './mcstorebus';

export const EVTYPE = {
    EVUPDATE: 'EVUPDATE',
    EVREMOVE: 'EVREMOVE',
    EVADD: 'EVADD',
    EVSET: 'EVSET'
};

const _KNOWN_EVENTS = _.values(EVTYPE);

function isKnownEvent(event) {
    return _KNOWN_EVENTS.indexOf(event) !== -1;
}

export class MCStore {
    constructor(name, initialState) {
        this.name = name;
        this.db = localforage.createInstance({name: name});
        this.storeInitialized = false;
        this.store = initialState;
        this.bus = new MCStoreBus();
    }

    storeReady() {
        if (this.storeInitialized) {
            return Promise.resolve(null);
        }

        return this.db.getItem(this.name).then(
            value => {
                if (!value) {
                    return this.db.setItem(this.name, this.store).then(() => this.storeInitialized = true);
                } else {
                    this.store = value;
                    this.storeInitialized = true;
                    return null;
                }
            }
        );
    }

    reset(initialState) {
        this.store = initialState;
        return this.db.setItem(this.name, this.store);
    }

    removeStore() {
        this.store = null;
        return this.db.removeItem(this.name);
    }

    subscribe(event, fn) {
        if (!isKnownEvent(event)) {
            throw new Error(`Unknown Event ${event}`);
        }

        return this.bus.subscribe(event, fn);
    }

    update(arg, fn) {
        return this._performStoreAction(EVTYPE.EVUPDATE, arg, fn);
    }

    remove(arg, fn) {
        return this._performStoreAction(EVTYPE.EVREMOVE, arg, fn);
    }

    add(arg, fn) {
        return this._performStoreAction(EVTYPE.EVADD, arg, fn);
    }

    _performStoreAction(event, arg, fn) {
        return this._setNoFire(fn).then(
            () => this.bus.fireEvent(event, arg, this.store)
        );
    }

    getStore() {
        return this.store;
    }

    // Allows user to set a value and fire the EVSET event
    set(arg, fn) {
        fn(this.store);
        return this.db.setItem(this.name, this.store).then(
            () => this.bus.fireEvent(EVTYPE.EVSET, arg, this.store)
        ).catch(err => console.log('failed to update', err));
    }

    // Sets a value in the store.
    _setNoFire(fn) {
        fn(this.store);
        return this.db.setItem(this.name, this.store).then(
            () => null
        ).catch(err => console.log('failed to update', err));
    }
}