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
                                    "$stateParams", "projectState", "toggleDragButton",
                                    wizardStepFilesDirectiveController]);
function wizardStepFilesDirectiveController($scope, provStep, pubsub, projectFiles,
                                            $stateParams, projectState, toggleDragButton) {
    $scope.wizardState = projectState.get($stateParams.id, $stateParams.sid);
    $scope.step = provStep.getCurrentStep($scope.wizardState.project.id);
    toggleDragButton.toggle("files", "addToProv");
    var files = $scope.wizardState.currentDraft[$scope.step.stepType].files;
    $scope.files = files;
    projectFiles.resetSelectedFiles(files.properties.files, $scope.wizardState.project.id);
    $scope.next = function() {
        provStep.setProjectNextStep($stateParams.id, $scope.wizardState.selectedTemplate);
    };

    provStep.onLeave($scope.wizardState.project.id, function() {
        files.done = true;
        toggleDragButton.toggle("files", "addToProv");
    });

    $scope.removeFile = function (index) {
        var stepType = $scope.step.stepType;
        files.properties.files[index].selected = false;
        files.properties.files.splice(index, 1);
    };

    pubsub.waitOn($scope, "provenance.files", function(fileentry) {
        // file selected
        var i = _.indexOf(files.properties.files, function(file) {
            return file.id === fileentry.id;
        });
        if (i === -1) {
            files.properties.files.push(fileentry);
        }
    });
}
