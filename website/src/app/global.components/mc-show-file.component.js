class MCShowFileComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcShowFile', {
    templateUrl: 'app/global.components/mc-show-file.html',
    controller: MCShowFileComponentController,
    bindings: {
        file: '<'
    }
});