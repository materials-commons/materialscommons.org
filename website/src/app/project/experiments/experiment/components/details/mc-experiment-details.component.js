angular.module('materialscommons').component('mcExperimentDetails', {
    templateUrl: 'app/project/experiments/experiment/components/details/mc-experiment-details.html',
    controller: MCExperimentDetailsComponentController,
    bindings: {
        experiment: '='
    }
});

/*@ngInject*/
function MCExperimentDetailsComponentController($stateParams, experimentsService, toast) {
    let ctrl = this;

    ctrl.updateName = () => {
        experimentsService
            .updateForProject($stateParams.project_id, $stateParams.experiment_id,
                              {name: ctrl.experiment.name})
            .then(
                () => null,
                () => toast.error('Failed to update experiment name')
            );
    };

    ctrl.updateDescription = () => {
        experimentsService
            .updateForProject($stateParams.project_id, $stateParams.experiment_id,
                              {description: ctrl.experiment.description})
            .then(
                () => null,
                () => toast.error('Failed to update experiment description')
            );
    };
}
