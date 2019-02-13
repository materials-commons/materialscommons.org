class MCProjectProcessViewComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.state = {
            process: null,
        };
    }

    $onChanges(changes) {
        if (changes.process) {
            this.state.process = angular.copy(changes.process.currentValue);
        }
    }

    showJson() {
        this.mcshow.showJson(this.state.process);
    }
}

angular.module('materialscommons').component('mcProjectProcessView', {
    controller: MCProjectProcessViewComponentController,
    template: require('./project-process-view.html'),
    bindings: {
        process: '<'
    }
});