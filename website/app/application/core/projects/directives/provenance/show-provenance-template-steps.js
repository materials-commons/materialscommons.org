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
                                   ["$scope", "$stateParams", "provStep", "projectColors",
                                    "actionStatus", showProvenanceTemplateStepsDirectiveController]);
function showProvenanceTemplateStepsDirectiveController($scope, $stateParams,
                                                        provStep, projectColors, actionStatus) {
    var currentProjectColor = projectColors.getCurrentProjectColor();

    function isCurrentProcessStep(stepType, stepName) {
        var currentStep = provStep.getCurrentStep($stateParams.id);
        return (currentStep.stepType === stepType && currentStep.step === stepName);
    }

    function isProcessStepDone(stepType, stepName) {
        var state = actionStatus.getCurrentActionState($stateParams.id);
        if (!state || !state.currentDraft) {
            return false;
        }
        return state.currentDraft[stepType][stepName].done;
    }

    $scope.getStyle = function(stepType, stepName) {
        if (isCurrentProcessStep(stepType, stepName)) {
            return {
                'background-color': currentProjectColor
            };
        } else if (isProcessStepDone(stepType, stepName)) {
            return {
                'background-color': "#18b194"
            };
        }

        return {};
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

    $scope.gotoStep = function(templateType, templateID) {
        var state = actionStatus.getCurrentActionState($stateParams.id);
        if (!state || !state.currentDraft) {
            return;
        }
        var step = provStep.makeStep(templateType, templateID);
        provStep.setStep($stateParams.id, step);
    };
}
