angular.module('materialscommons').component('mcExperimentDetails', {
    templateUrl: 'app/project/experiments/experiment/components/details/mc-experiment-details.html',
    controller: MCExperimentDetailsComponentController,
    bindings: {
        experiment: '='
    }
});

/*@ngInject*/
function MCExperimentDetailsComponentController($stateParams, experimentsAPI, toast, $scope, editorOpts) {
    let ctrl = this;

    $scope.editorOptions = editorOpts({height: 67, width: 41});

    ctrl.updateName = () => {
        experimentsAPI.updateForProject($stateParams.project_id, $stateParams.experiment_id, {name: ctrl.experiment.name})
            .then(
                () => null,
                () => toast.error('Failed to update experiment name')
            );
    };

    ctrl.updateStatus = () => {
        experimentsAPI.updateForProject($stateParams.project_id, $stateParams.experiment_id, {status: ctrl.experiment.status})
            .then(
                () => null,
                () => toast.error('Failed to update experiment status')
            );
    };

    ctrl.updateDescription = () => {
        experimentsAPI.updateForProject($stateParams.project_id, $stateParams.experiment_id,
                {description: ctrl.experiment.description})
            .then(
                () => null,
                () => toast.error('Failed to update experiment description')
            );
    };

    ctrl.updateNote = () => {
        if (ctrl.experiment.note === null) {
            return;
        }

        experimentsAPI.updateForProject($stateParams.project_id, $stateParams.experiment_id, {note: ctrl.experiment.note})
            .then(
                () => null,
                () => toast.error('Failed to update note')
            );
    };
}

