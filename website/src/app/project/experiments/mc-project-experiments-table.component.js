angular.module('materialscommons').component('mcProjectExperimentsTable', {
    template: require('./mc-project-experiments-table.html'),
    controller: MCProjectExperimentsTableComponentController,
    bindings: {
        experiments: '=',
        filterBy: '<'
    }
});

function MCProjectExperimentsTableComponentController() {
    let ctrl = this;
    ctrl.sortOrder = 'name';
}

