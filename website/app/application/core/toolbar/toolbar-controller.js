Application.Controllers.controller('toolbar',
    ["$scope", "Nav", "alertService", function ($scope, Nav, alertService) {
        $scope.showDrafts = true;

        $scope.isActiveStep = function (nav) {
            return Nav.isActiveToolbar(nav);
        };

        $scope.showStep = function (step) {
            Nav.setActiveToolbar(step);
        };

    }]);









