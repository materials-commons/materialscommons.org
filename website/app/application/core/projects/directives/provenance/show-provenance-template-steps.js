Application.Directives.directive('showProvenanceTemplateSteps', showProvenanceTemplateStepsDirective);

function showProvenanceTemplateStepsDirective() {
    return {
        scope: {
            template: "=",
            showOverview: "="
        },
        controller: "showProvenanceTemplateStepsDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/show-provenance-template-steps.html"
    };
}

Application.Controllers.controller('showProvenanceTemplateStepsDirectiveController',
                                   ["$scope", "$stateParams", "provStep", "projectState",
                                    showProvenanceTemplateStepsDirectiveController]);
function showProvenanceTemplateStepsDirectiveController($scope, $stateParams,
                                                        provStep, projectState) {
    function isCurrentProcessStep(stepType, stepName) {
        var currentStep = provStep.getCurrentStep($stateParams.id);
        return (currentStep.stepType === stepType && currentStep.step === stepName);
    }

    function isProcessStepDone(stepType, stepName) {
        var state = projectState.get($stateParams.id, $stateParams.sid);
        if (!state || !state.currentDraft) {
            return false;
        }

        switch (stepType) {
        case "process":
            return state.currentDraft.process.done;
        case "done":
            return state.currentDraft.completed;
        default:
            return state.currentDraft[stepType][stepName].done;
        }
    }

    $scope.getStyle = function(stepType, stepName) {
        if (isCurrentProcessStep(stepType, stepName)) {
            return {
                'background-color': '#708090'
            };
        } else if (isProcessStepDone(stepType, stepName)) {
            return {
                'background-color': "#18b194"
            };
        }

        return {};
    };

    $scope.getStepNameClass = function(stepType, stepName) {
        if (isProcessStepDone(stepType, stepName)) {
            return "bs-wizard-stepdone";
        }

        if (isCurrentProcessStep(stepType, stepName)) {
            return "bs-wizard-stepnum";
        }

        return "bs-wizard-info";
    };

    function templateStepsCount() {
        if (!$scope.template) {
            return 0;
        }

        var count = $scope.template.input_templates.length;
        count += ($scope.template.required_input_files ? 1 : 0);
        count += $scope.template.output_templates.length;
        count += ($scope.template.required_output_files ? 1 : 0);
        return count;
    }

    $scope.offsetSteps = function() {
        return templateStepsCount() == 4;
    };

    $scope.showDone = function() {
        var state = projectState.get($stateParams.id, $stateParams.sid);
        if (!state || !state.currentDraft) {
            return false;
        }

        return true;
    };

    $scope.gotoStep = function(templateType, templateID) {
        var state = projectState.get($stateParams.id, $stateParams.sid);
        if (!state || !state.currentDraft) {
            return;
        }
        var step = provStep.makeStep(templateType, templateID);
        provStep.setStep($stateParams.id, step);
    };
}
