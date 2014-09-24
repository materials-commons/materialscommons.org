Application.Directives.directive('wizardStepFiles', wizardStepFilesDirective);

function wizardStepFilesDirective() {
    return {
        scope: {},
        controller: "wizardStepFilesDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-files.html"
    };
}

Application.Controllers.controller('wizardStepFilesDirectiveController',
                                   ["$scope", "provStep", "pubsub", "projectFiles",
                                    "$stateParams", "actionStatus",
                                    wizardStepFilesDirectiveController]);
function wizardStepFilesDirectiveController($scope, provStep, pubsub, projectFiles,
                                            $stateParams, actionStatus) {
    $scope.wizardState = actionStatus.getCurrentActionState($stateParams.id);
    $scope.step = provStep.getCurrentStep($scope.wizardState.project.id);
    projectFiles.setChannel("provenance.files");
    projectFiles.resetSelectedFiles($scope.wizardState.currentDraft[$scope.step.stepType].files.files,
                                    $scope.wizardState.project.id);
    $scope.next = function() {
        provStep.setProjectNextStep($scope.project.id, $scope.wizardState.selectedTemplate);
    };

    $scope.removeFile = function (index) {
        var stepType = $scope.step.stepType;
        $scope.wizardState.currentDraft[stepType].files.files[index].selected = false;
        $scope.wizardState.currentDraft[stepType].files.files.splice(index, 1);
    };

    pubsub.waitOn($scope, "provenance.files", function(fileentry) {
        var stepType = $scope.step.stepType;
        if (fileentry.selected) {
            // file selected
            $scope.wizardState.currentDraft[stepType].files.files.push(fileentry);
        } else {
            // file deselected
            var i = _.indexOf($scope.wizardState.currentDraft[stepType].files.files, function(file) {
                return file.id === fileentry.id;
            });
            if (i !== -1) {
                $scope.wizardState.currentDraft[stepType].files.files.splice(i, 1);
            }
        }
    });
}
