Application.Directives.directive('wizardStepDone', wizardStepDoneDirective);

function wizardStepDoneDirective() {
    return {
        scope: {},
        controller: "wizardStepDoneDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-done.html"
    };
}

Application.Controllers.controller('wizardStepDoneDirectiveController',
                                   ["$scope", "provStep", "$stateParams",
                                    "Restangular", "User", "$timeout", "model.projects",
                                    "projectState", "recent", wizardStepDoneDirectiveController]);
function wizardStepDoneDirectiveController($scope, provStep, $stateParams, Restangular, User,
                                           $timeout, projects, projectState, recent) {
    var state = projectState.get($stateParams.id, $stateParams.sid);
    $scope.unfinishedSteps = [];
    function determineDoneState() {
        if (!state.currentDraft.process.done) {
            $scope.unfinishedSteps.push({
                stepType: "process",
                step: "process",
                name: state.selectedTemplate.template_name
            });
        }
        state.selectedTemplate.input_templates.forEach(function(t) {
            if (!state.currentDraft.inputs[t.id].done) {
                $scope.unfinishedSteps.push({
                    stepType: "inputs",
                    step: t.id,
                    name: "(I) " + t.template_name
                });
            }
        });

        if (state.selectedTemplate.required_input_files) {
            if (!state.currentDraft.inputs.files.done) {
                $scope.unfinishedSteps.push({
                    stepType: "inputs",
                    step: "files",
                    name: "(I) Files"
                });
            }
        }

        state.selectedTemplate.output_templates.forEach(function(t) {
            if (!state.currentDraft.outputs[t.id].done) {
                $scope.unfinishedSteps.push({
                    stepType: "outputs",
                    step: t.id,
                    name: "(O) " + t.template_name
                });
            }
        });

        if (state.selectedTemplate.required_output_files) {
            if (!state.currentDraft.outputs.files.done) {
                $scope.unfinishedSteps.push({
                    stepType: "outputs",
                    step: "files",
                    name: "(O) Files"
                });
            }
        }

        if ($scope.unfinishedSteps.length === 0) {
            state.currentDraft.completed = true;
        }
    }

    determineDoneState();

    $scope.gotoStep = function(stepType, stepName) {
        var step = provStep.makeStep(stepType, stepName);
        provStep.setStep($stateParams.id, step);
    };

    function closeProvenanceAction() {
        provStep.resetProject($stateParams.id);
        recent.gotoLast($stateParams.id, $stateParams.sid);
    }

    $scope.submit = function() {
        Restangular.one("provenance2")
            .post($stateParams.id,
                  state.currentDraft,
                  {apikey: User.apikey()})
            .then(function() {
                recent.delete($stateParams.id, $stateParams.sid);
                projectState.delete($stateParams.id, $stateParams.sid);
                closeProvenanceAction();
            });
    };

    $scope.saveDraft = function() {
        Restangular.one("drafts2")
            .post($stateParams.id,
                  state.currentDraft,
                  {apikey: User.apikey()})
            .then(function(id) {
                projects.getList(true).then(function() {
                    closeProvenanceAction();
                });
            });
    };

    $scope.cancel = function() {
        // The bootstrap modal black backdrop isn't dismissed
        // if we don't wrap these functions in a timeout. It
        // appears that the changes to the dom are happening
        // too quickly.
        $timeout(function() {
            recent.delete($stateParams.id, $stateParams.sid);
            projectState.delete($stateParams.id, $stateParams.sid);
            closeProvenanceAction();
        }, 100);
    };
}
