class MCFileComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            file: null
        };
    }

    $onChanges(changes) {
        if (changes.file) {
            this.state.file = angular.copy(changes.file.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcFile', {
    template: require('./mc-file.html'),
    controller: MCFileComponentController,
    bindings: {
        file: '<'
    }
});

