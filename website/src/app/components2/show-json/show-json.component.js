class MCShowJsonComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.state = {
            object: null,
        };
    }

    $onChanges(changes) {
        if (changes.object) {
            this.state.object = changes.object.currentValue;
        }
    }

    showJson() {
        this.mcshow.showJson(this.state.object);
    }
}

angular.module('materialscommons').component('mcShowJson', {
    controller: MCShowJsonComponentController,
    template: `<a class="md-subhead" ng-click="$ctrl.showJson()">show json</a>`,
    bindings: {
        object: '<'
    }
});