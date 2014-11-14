Application.Directives.directive("createSampleToolbar", createSampleToolbarDirective);

function createSampleToolbarDirective() {
    return {
        replace: true,
        restrict: "AE",
        controller: "createSampleToolbarDirectiveController",
        templateUrl: "application/core/projects/project/action/create-sample-toolbar.html"
    };
}

Application.Controllers.controller("createSampleToolbarDirectiveController",
                                   ["$scope", "projectColors", "ui", "$stateParams",
                                    createSampleToolbarDirectiveController]);

function createSampleToolbarDirectiveController($scope, projectColors, ui, $stateParams) {

    function handleButtonSpecific(currentActive, what) {
        if (what === "attachments" && currentActive === "attachments") {
            // Hide files because attachments is the current view.
            ui.setShowFiles($stateParams.id, false);
        } else if (what === "attachments") {
            // Show files because we are just going to attachments.
            ui.setShowFiles($stateParams.id, true);
        }
    }

    $scope.setActive = function(what) {
        var currentActive = $scope.activeToolbarItem;
        if ($scope.activeToolbarItem === what) {
            $scope.activeToolbarItem = ""; // toggle
        } else {
            $scope.activeToolbarItem = what;
        }
        handleButtonSpecific(currentActive, what);
    };

    $scope.projectColor = function() {
        return {
            'background-color': projectColors.getCurrentProjectColor()
        };
    };
}
