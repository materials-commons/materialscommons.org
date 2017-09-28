class MCProjStoreService {
    constructor() {
        this.projects = {};
        this.bus = {
            'PROJECT$CHANGE': [],
            'EXPERIMENT$CHANGE': [],
            'PROCESS$CHANGE': [],
            'SAMPLE$CHANGE': []
        };
    }

    subscribe(which, listener) {
        if (!_.isFunction(listener)) {
            throw new Error('Listener must be a function');
        }

        if (!this._knownChangeListenerType(which)) {
            throw new Error(`Unknown change listener type: ${which}`);
        }

        this.bus[which].push(listener);
        return () => {
            const index = this.bus[which].indexOf(listener);
            if (index !== -1) {
                this.bus[which].splice(index, 1);
            }
        };
    }

    _knownChangeListenerType(which) {
        switch (which) {
            case this.constructor.PROJECT$CHANGE:
                return true;
                break;
            case this.constructor.PROCESS$CHANGE:
                return true;
                break;
            case this.constructor.EXPERIMENT$CHANGE:
                return true;
                break;
            case this.constructor.SAMPLE$CHANGE:
                return true;
                break;
            default:
                return false;
        }
    }

    addProject(project) {
        this.projects[project.id] = project;
    }

    updateProject(id, fn) {
        let proj = _.findKey(this.projects);
    }

    get PROJECT$CHANGE() {
        return this.constructor.PROJECT$CHANGE;
    }

    get EXPERIMENT$CHANGE() {
        return this.constructor.EXPERIMENT$CHANGE;
    }

    get PROCESS$CHANGE() {
        return this.constructor.PROCESS$CHANGE;
    }

    get SAMPLE$CHANGE() {
        return this.constructor.SAMPLE$CHANGE;
    }
}

MCProjStoreService.PROJECT$CHANGE = 'PROJECT$CHANGE';
MCProjStoreService.EXPERIMENT$CHANGE = 'EXPERIMENT$CHANGE';
MCProjStoreService.PROCESS$CHANGE = 'PROCESS$CHANGE';
MCProjStoreService.SAMPLE$CHANGE = 'SAMPLE$CHANGE';


angular.module('materialscommons').service('mcprojstore', MCProjStoreService);
