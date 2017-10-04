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
        this.db.setItem(this.name, this.store);
    }

    removeStore() {
        this.store = null;
        this.db.removeItem(this.name);
    }

    subscribe(event, fn) {
        if (!isKnownEvent(event)) {
            throw new Error(`Unknown Event ${event}`);
        }

        return this.bus.subscribe(event, fn);
    }

    update(fn) {
        this._performStoreAction(EVTYPE.EVUPDATE, fn);
    }

    remove(fn) {
        this._performStoreAction(EVTYPE.EVREMOVE, fn);
    }

    add(fn) {
        this._performStoreAction(EVTYPE.EVADD, fn);
    }

    _performStoreAction(event, fn) {
        this.set(fn);
        this.bus.fireEvent(event, this.store);
    }

    getStore() {
        return this.store;
    }

    // Sets a value in the store without firing events
    set(fn) {
        fn(this.store);
        this.db.setItem(this.name, this.store).then(
            () => null
        ).catch(err => console.log('failed to update', err));
    }
}