angular.module('materialscommons').component('mcExperimentDetailsField', {
    template: require('./mc-experiment-details-field.html'),
    controller: MCExperimentDetailsFieldComponentController,
    bindings: {
        experiment: '=',
        heading: '@',
        label: '@',
        field: '@'
    }
});

/*@ngInject*/
function MCExperimentDetailsFieldComponentController(experimentsAPI, $stateParams, toast) {
    let ctrl = this,
        projectId = $stateParams.project_id;

    ctrl.add = (field) => ctrl.experiment[field].push("");

    ctrl.update = (field) => {
        let updateArgs = {};
        updateArgs[field] = ctrl.experiment[field];
        experimentsAPI.updateForProject(projectId, ctrl.experiment.id, updateArgs).then(
            () => null,
            () => toast.error(`Failed to update experiment ${ctrl.label}`)
        );
    };

    ctrl.remove = (field, index) => {
        ctrl.experiment[field].splice(index, 1);
        let removeArgs = {};
        removeArgs[field] = ctrl.experiment[field];
        experimentsAPI.updateForProject(projectId, ctrl.experiment.id, removeArgs).then(
            () => null,
            () => toast.error(`Failed to update experiment ${ctrl.label}`)
        );
    };
}
