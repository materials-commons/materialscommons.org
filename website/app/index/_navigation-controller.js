Application.Controllers.controller('_indexNavigation', ["$scope", function ($scope) {
    $scope.isActiveStep = function (nav) {
        return $scope.activeStep === nav;
    };

    $scope.showStep = function (step) {
        $scope.activeStep = step;
    };
}]);