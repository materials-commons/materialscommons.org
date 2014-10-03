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
    var files = $scope.wizardState.currentDraft[$scope.step.stepType].files;
    $scope.files = files;
    projectFiles.resetSelectedFiles(files.properties.files, $scope.wizardState.project.id);
    $scope.next = function() {
        provStep.setProjectNextStep($stateParams.id, $scope.wizardState.selectedTemplate);
    };

    provStep.onLeave($scope.wizardState.project.id, function() {
        files.done = true;
    });

    $scope.removeFile = function (index) {
        var stepType = $scope.step.stepType;
        files.properties.files[index].selected = false;
        files.properties.files.splice(index, 1);
    };

    pubsub.waitOn($scope, "provenance.files", function(fileentry) {
        if (fileentry.selected) {
            // file selected
            files.properties.files.push(fileentry);
        } else {
            // file deselected
            var i = _.indexOf(files.properties.files, function(file) {
                return file.id === fileentry.id;
            });
            if (i !== -1) {
                files.properties.files.splice(i, 1);
            }
        }
    });
}
