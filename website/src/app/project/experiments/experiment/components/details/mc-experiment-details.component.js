angular.module('materialscommons').component('mcExperimentDetails', {
    templateUrl: 'app/project/experiments/experiment/components/details/mc-experiment-details.html',
    controller: MCExperimentDetailsComponentController,
    bindings: {
        experiment: '='
    }
});

/*@ngInject*/
function MCExperimentDetailsComponentController($stateParams, experimentsService, toast, $scope, $mdDialog, editorOpts) {
    let ctrl = this;

    $scope.editorOptions = editorOpts({height: 67, width: 41});

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

    ctrl.updateNote = () => {
        if (ctrl.experiment.note === null) {
            return;
        }

        experimentsService
            .updateForProject($stateParams.project_id, $stateParams.experiment_id, {note: ctrl.experiment.note})
            .then(
                () => null,
                () => toast.error('Failed to update note')
            );
    };

    ctrl.publishExperiment = () => {
        $mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/details/publish-experiment-dialog.html',
            controller: PublishExperimentDialogController,
            controllerAs: 'ctrl',
            bindToController: true
        });
    };

    ctrl.addGoal = () => {
        ctrl.experiment.goals.push("");
    };

    ctrl.removeGoal = (index) => {
        console.log(index);
        ctrl.experiment.goals.splice(index,1);
    };
}

class PublishExperimentDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
