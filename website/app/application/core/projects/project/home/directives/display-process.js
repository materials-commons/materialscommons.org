Application.Directives.directive("displayProcess", displayProcessDirective);
function displayProcessDirective() {
    return {
        restrict: "E",
        scope: {
            modal: "=modal"
        },
        controller: "displayProcessDirectiveController",
        templateUrl: "application/core/projects/project/home/directives/display-process.html"
    };
}

Application.Controllers.controller("displayProcessDirectiveController",
    ["$scope", "$log",
        displayProcessDirectiveController]);

function displayProcessDirectiveController($scope, $log) {

    $scope.selected = {
        item: $scope.modal.process
    };
    $scope.process = $scope.modal.process;
    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected);
    };

    $scope.cancel = function () {
        $scope.modal.instance.dismiss('cancel');
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });
}
