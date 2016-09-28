class CurrentTask {
    constructor() {
        this.currentTask = null;
        this.onChangeFN = null;
    }

    setOnChange(fn) {
        this.onChangeFN = fn;
    }

    get() {
        return this.currentTask;
    }

    set(task) {
        this.currentTask = task;
        if (this.onChangeFN) {
            this.onChangeFN();
        }
    }
}

angular.module('materialscommons').service('currentTask', CurrentTask);
