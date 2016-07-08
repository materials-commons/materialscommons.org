class MCShowSampleComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcShowSample', {
    templateUrl: 'app/global.components/mc-show-sample.html',
    controller: MCShowSampleComponentController,
    bindings: {
        sample: '<'
    }
});
