class MCFileComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            file: null,
            isBetaUser: false,
        };
    }

    $onChanges(changes) {
        if (changes.file) {
            this.state.file = angular.copy(changes.file.currentValue);
        }

        if (changes.isBetaUser) {
            this.state.isBetaUser = changes.isBetaUser.currentValue;
        }
    }
}

angular.module('materialscommons').component('mcFile', {
    template: require('./mc-file.html'),
    controller: MCFileComponentController,
    bindings: {
        file: '<',
        isBetaUser: '<',
    }
});

