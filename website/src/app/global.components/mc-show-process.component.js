class MCShowProcessComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcShowProcess', {
    templateUrl: 'app/global.components/mc-show-process.html',
    controller: MCShowProcessComponentController,
    bindings: {
        process: '<'
    }
});
