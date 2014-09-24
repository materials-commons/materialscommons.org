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
                                   ["$scope", "provStep", "actionStatus", "$stateParams",
                                    wizardStepDoneDirectiveController]);
function wizardStepDoneDirectiveController($scope, provStep, actionStatus, $stateParams) {
    var state = actionStatus.getCurrentActionState($stateParams.id);
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
    }

    determineDoneState();
}
