/*@ngInject*/
class MCExperimentCollaboratorsComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, $stateParams, toast) {
        this.experimentsAPI = experimentsAPI;
        this.projectId = $stateParams.projectId;
        this.toast = toast;
    }

    add(field) {
        this.experiment[field].push("");
    }

    update(field) {
        let updateArgs = {};
        updateArgs[field] = this.experiment[field];
        this.experimentsAPI.updateForProject(this.projectId, this.experiment.id, updateArgs).then(
            () => null,
            () => this.toast.error(`Failed to update experiment ${this.label}`)
        );
    }

    remove(field, index) {
        this.experiment[field].splice(index, 1);
        let removeArgs = {};
        removeArgs[field] = this.experiment[field];
        this.experimentsAPI.updateForProject(this.projectId, this.experiment.id, removeArgs).then(
            () => null,
            () => this.toast.error(`Failed to update experiment ${this.label}`)
        );
    }
}

angular.module('materialscommons').component('mcExperimentCollaborators', {
    template: require('./mc-experiment-collaborators.html'),
    controller: MCExperimentCollaboratorsComponentController,
    bindings: {
        experiment: '=',
        heading: '@',
        label: '@',
        field: '@'
    }
});

