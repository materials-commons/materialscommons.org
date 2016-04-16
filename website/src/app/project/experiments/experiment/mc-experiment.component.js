angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});

/*@ngInject*/
function MCExperimentComponentController($scope, $stateParams, experimentsService, currentExperiment, toast) {
    let ctrl = this;
    ctrl.experiment = currentExperiment.get();

    let lastNotes = ctrl.experiment.notes;

    $scope.editorOptions = {
        height: '67vh',
        width: '43vw',
        uiColor: '#f4f5f7'
    };

    ctrl.updateNotes = () => {
        if (!ctrl.experiment.notes) {
            ctrl.experiment.notes = '';
        }

        if (lastNotes === ctrl.experiment.notes) {
            return;
        }

        experimentsService
            .updateForProject($stateParams.project_id, $stateParams.experiment_id, {notes: ctrl.experiment.notes})
            .then(
                () => null,
                () => toast.error('Failed to update notes')
            );
    };
}


