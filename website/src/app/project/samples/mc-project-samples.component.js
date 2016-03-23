angular.module('materialscommons').component('mcProjectSamples', {
    templateUrl: 'app/project/samples/mc-project-samples.html',
    controller: MCProjectSamplesComponentController,
    bindings: {
        samples: '='
    }
});

/*@ngInject*/
function MCProjectSamplesComponentController() {
    var ctrl = this;
    ctrl.query = '';
    ctrl.showTableView = true;
}

