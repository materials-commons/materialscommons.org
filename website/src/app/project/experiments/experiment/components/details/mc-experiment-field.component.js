angular.module('materialscommons').component('mcExperimentField', {
    templateUrl: 'app/project/experiments/experiment/components/details/mc-experiment-field.html',
    controller: MCExperimentFieldComponentController,
    bindings: {
        experiment: '=',
        heading: '@',
        label: '@',
        what: '@'
    }
});
/*@ngInject*/
function MCExperimentFieldComponentController(experimentsService, $stateParams, toast) {
    let ctrl = this;
    ctrl.add = (what) => {
        experimentsService.getForProject($stateParams.project_id, $stateParams.experiment_id).then(
            (exp) => {
                ctrl.experiment = exp;
                ctrl.experiment[what].push("");
            }
        );
    };

    ctrl.update = (what, value, index) => {
        var obj = {};
        obj[what] = value;
        obj['index'] = index - 1;
        obj['action'] = 'add';
        experimentsService
            .updateForProject($stateParams.project_id, $stateParams.experiment_id, obj)
            .then(
                () => null,
                () => toast.error('Failed to update experiment description')
            );
    };

    ctrl.remove = (what, value, index) => {
        var obj = {};
        obj[what] = value;
        obj['index'] = index;
        obj['action'] = 'remove';
        experimentsService
            .updateForProject($stateParams.project_id, $stateParams.experiment_id, obj)
            .then(
                () => ctrl.experiment[ctrl.what].splice(index, 1),
                () => toast.error('Failed to update experiment description')
            );
    };
}
