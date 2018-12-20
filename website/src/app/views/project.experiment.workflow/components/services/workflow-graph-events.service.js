class MCWorkflowGraphEventsService {
    /*@ngInject*/
    constructor(mcbus) {
        this.mcbus = mcbus;
        this.myName = 'MCWorkflowGraphEventsService';
        this.subscribedEvents = [];
    }

    subscribe(event, fn) {
        this.subscribedEvents.push(event);
        this.mcbus.subscribe(event, this.myName, fn)
    }

    leave() {
        this.subscribedEvents.forEach(e => this.mcbus.leave(e, this.myName));
    }
}

angular.module('materialscommons').service('mcWorkflowGraphEvents', MCWorkflowGraphEventsService);