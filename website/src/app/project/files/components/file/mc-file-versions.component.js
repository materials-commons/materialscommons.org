class MCFileVersionsComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcFileVersions', {
    controller: MCFileVersionsComponentController,
    template: require('./mc-file-versions.html'),
    bindings: {
        file: '<'
    }
});