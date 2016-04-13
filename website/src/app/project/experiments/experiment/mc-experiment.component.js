angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController,
    bindings: {
        experiment: '='
    }
});

/*@ngInject*/
function MCExperimentComponentController($scope) {
    $scope.editorOptions = {
        height: '68vh',
        width: '38vw',
        uiColor: '#f4f5f7'
    };
}


