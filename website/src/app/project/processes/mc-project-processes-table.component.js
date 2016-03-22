angular.module('materialscommons').component('mcProjectProcessesTable', {
    templateUrl: 'app/project/processes/mc-project-processes-table.html',
    controller: MCProjectProcessesTableComponentController,
    bindings: {
        processes: '<',
        filterBy: '='
    }
});

/*@ngInject*/
function MCProjectProcessesTableComponentController() {
    var ctrl = this;
    ctrl.showFiles = showFiles;
    ctrl.showSamples = showSamples;
    ctrl.sortOrder = "name";

    function showFiles() {

    }

    function showSamples() {

    }
}
