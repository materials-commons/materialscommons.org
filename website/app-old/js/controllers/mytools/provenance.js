
function DraftsListController($scope, pubsub, Stater) {
    pubsub.waitOn($scope, 'drafts.change', function() {
        $scope.drafts = Stater.all;
    });

    $scope.drafts = Stater.all;

    $scope.delete = function(stateId) {
        Stater.clearRemote(stateId, function() {
            pubsub.send('drafts.update', '');
        })
    }
}

function ProvenanceController($scope, trackSavedProv, wizard, $stateParams, Stater) {
    wizard.waitOn($scope, 'nav_choose_inputs', function() {
        $scope.state = Stater.retrieve();
    });

    wizard.waitOn($scope, 'nav_choose_outputs', function() {
        $scope.state = Stater.retrieve();
    });

    $scope.project_id = $stateParams.id;
    var steps = {
        step: 'nav_choose_process',
        children: [
            {step: 'nav_choose_inputs'},
            {step: 'nav_choose_outputs'},
            {step: 'nav_choose_upload'}
        ]
    };

    wizard.setSteps(steps);

    $scope.isCurrentStep = function (step) {
        $scope.process_saved = trackSavedProv.get_process_status();
        $scope.inputs_saved = trackSavedProv.get_input_status();
        $scope.outputs_saved = trackSavedProv.get_output_status();

        return wizard.currentStep() == step;

    }

    $scope.process_saved = trackSavedProv.get_process_status();
    $scope.inputs_saved = trackSavedProv.get_input_status();
    $scope.outputs_saved = trackSavedProv.get_output_status();

    $scope.removeInstructions = function () {
        $scope.display = true
    }

    $scope.editProcess = function () {
        wizard.fireStep('nav_choose_process');
    }

    $scope.editInputs = function () {
        wizard.fireStep('nav_choose_inputs');
    }

    $scope.editOutputs = function () {
        wizard.fireStep('nav_choose_outputs');
    }
}