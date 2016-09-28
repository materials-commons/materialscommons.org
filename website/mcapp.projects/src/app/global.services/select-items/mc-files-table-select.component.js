class MCFilesTableSelectComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcFilesTableSelect', {
    templateUrl: 'app/global.services/select-items/mc-files-table-select.html',
    controller: MCFilesTableSelectComponentController,
    bindings: {
        files: '<'
    }
});
