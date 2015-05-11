//Application.Directives.directive("displayProcess", displayProcessDirective);
//function displayProcessDirective() {
//    return {
//        restrict: "AE",
//        scope: {
//            modal: "="
//        },
//        controller: "displayProcessDirectiveController",
//        templateUrl: "application/core/projects/project/home/directives/display-process.html"
//    };
//}
//
//Application.Controllers.controller("displayProcessDirectiveController",
//    ["$scope", "$log",
//        displayProcessDirectiveController]);
//
//function displayProcessDirectiveController($scope, $log) {
//    $scope.selected = {
//        item: $scope.modal.item
//    };
//
//    $scope.ok = function () {
//        $scope.modal.instance.close($scope.selected.item);
//    };
//
//    $scope.cancel = function () {
//        $scope.modal.instance.dismiss('cancel');
//    };
//
//    $scope.modal.instance.result.then(function (selectedItem) {
//        $scope.selected = selectedItem;
//        console.dir($scope.selected);
//    }, function () {
//        $log.info('Modal dismissed at: ' + new Date());
//    });
//}
