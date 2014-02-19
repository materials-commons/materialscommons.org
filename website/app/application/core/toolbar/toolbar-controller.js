Application.Controllers.controller('toolbar', ["$scope", function ($scope) {
    $scope.showDrafts = false;

    $scope.isActiveStep = function (nav) {
        return $scope.activeStep === nav;
    };

    $scope.showStep = function (step) {
        $scope.activeStep = step;
    };
}]);



Application.Controllers.controller('navigation', ["$scope", function ($scope) {
    $scope.isActiveStep = function (nav) {
        return $scope.activeStep === nav;
    };

    $scope.showStep = function (step) {
        $scope.activeStep = step;
    };
}]);









