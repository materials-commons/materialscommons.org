angular.module('materialscommons').component('mcExperimentDetailsField', {
    templateUrl: 'app/project/experiments/experiment/components/details/mc-experiment-details-field.html',
    controller: MCExperimentDetailsFieldComponentController,
    bindings: {
        experiment: '=',
        heading: '@',
        label: '@',
        field: '@'
    }
});
/*@ngInject*/
function MCExperimentDetailsFieldComponentController(experimentsService, $stateParams, toast) {
    let ctrl = this;

    ctrl.add = (field) => ctrl.experiment[field].push("");

    ctrl.update = (field) => {
        let updateArgs = {};
        updateArgs[field] = ctrl.experiment[field];
        console.dir(updateArgs);
        experimentsService
            .updateForProject($stateParams.project_id, $stateParams.experiment_id, updateArgs)
            .then(
                () => null,
                () => toast.error('Failed to update experiment description')
            );
    };

    ctrl.remove = (field, index) => {
        ctrl.experiment[field].splice(index, 1);
        let removeArgs = {};
        removeArgs[field] = ctrl.experiment[field];
        experimentsService
            .updateForProject($stateParams.project_id, $stateParams.experiment_id, removeArgs)
            .then(
                () => null,
                () => toast.error('Failed to update experiment description')
            );
    };
}
