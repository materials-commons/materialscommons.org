Application.Directives.directive('wizardStepFiles', wizardStepFilesDirective);

function wizardStepFilesDirective() {
    return {
        scope: {
            project: "="
        },
        controller: "wizardStepFilesDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-files.html"
    };
}

Application.Controllers.controller('wizardStepFilesDirectiveController',
                                   ["$scope", "provStep", "pubsub", "projectFiles",
                                    wizardStepFilesDirectiveController]);
function wizardStepFilesDirectiveController($scope, provStep, pubsub, projectFiles) {
    $scope.model = {
        files: []
    };

    $scope.next = function() {
        provStep.setProjectNextStep($scope.project.id, $scope.project.selectedTemplate);
    };

    $scope.removeFile = function (index) {
        $scope.model.files[index].selected = false;
        $scope.model.files.splice(index, 1);
    };

    pubsub.waitOn($scope, "provenance.files", function(fileentry) {
        if (fileentry.selected) {
            // file selected
            $scope.model.files.push(fileentry);
        } else {
            // file deselected
            var i = _.indexOf($scope.model.files, function(file) {
                return file.id === fileentry.id;
            });
            if (i !== -1) {
                $scope.model.files.splice(i, 1);
            }
        }
    });
}
