angular.module('materialscommons').component('mcExperimentDetails', {
    template: require('./mc-experiment-details.html'),
    controller: MCExperimentDetailsComponentController,
    bindings: {
        experiment: '=',
        showNote: '@'
    }
});

/*@ngInject*/
function MCExperimentDetailsComponentController($stateParams, experimentsAPI, toast, $scope, editorOpts) {
    let ctrl = this,
        projectId = $stateParams.project_id,
        experimentId = this.experiment.id;

    $scope.editorOptions = editorOpts({height: 67, width: 41});

    ctrl.updateName = () => {
        experimentsAPI.updateForProject(projectId, experimentId, {name: ctrl.experiment.name})
            .then(
                () => null,
                () => toast.error('Failed to update experiment name')
            );
    };

    ctrl.updateStatus = () => {
        experimentsAPI.updateForProject(projectId, experimentId, {status: ctrl.experiment.status})
            .then(
                () => null,
                () => toast.error('Failed to update experiment status')
            );
    };

    ctrl.updateDescription = () => {
        experimentsAPI.updateForProject(projectId, experimentId,
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

        experimentsAPI.updateForProject(projectId, experimentId, {note: ctrl.experiment.note})
            .then(
                () => null,
                () => toast.error('Failed to update note')
            );
    };
}

