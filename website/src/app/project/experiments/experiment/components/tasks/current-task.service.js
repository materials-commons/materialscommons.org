class CurrentTask {
    constructor() {
        this.currentTask = null;
    }

    get() {
        return this.currentTask;
    }

    set(task) {
        this.currentTask = task;
    }
}

angular.module('materialscommons').service('currentTask', CurrentTask);
