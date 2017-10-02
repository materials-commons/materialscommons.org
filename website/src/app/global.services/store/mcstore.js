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
    constructor(initialState) {
        this.store = initialState;
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