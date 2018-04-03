class MCFilesTableSelectComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcFilesTableSelect', {
    template: require('./mc-files-table-select.html'),
    controller: MCFilesTableSelectComponentController,
    bindings: {
        files: '<'
    }
});
