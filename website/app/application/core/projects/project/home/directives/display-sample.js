//Application.Directives.directive("displaySample", displaySampleDirective);
//function displaySampleDirective() {
//    return {
//        restrict: "E",
//        scope: {
//            modal: "=modal"
//        },
//        controller: "displaySampleDirectiveController",
//        templateUrl: "application/core/projects/project/home/directives/display-sample.html"
//    };
//}
//Application.Controllers.controller("displaySampleDirectiveController",
//    ["$scope", "$log",
//        displaySampleDirectiveController]);
//
//function displaySampleDirectiveController($scope, $log) {
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
//    }, function () {
//        $log.info('Modal dismissed at: ' + new Date());
//    });
//}