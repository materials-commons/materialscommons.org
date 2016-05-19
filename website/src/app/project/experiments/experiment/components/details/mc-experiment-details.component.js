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
                () => null,
                () => toast.error('Failed to update experiment description')
            );
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
