//Application.Controllers.controller('ModalDemoCtrl',
//    ["$scope", "$modal", function ($scope,  $modal) {
//        $scope.items = ['item1', 'item2', 'item3'];
//
//        $scope.open = function () {
//            var modalInstance = $modal.open({
//                templateUrl: 'application/core/modal/sub.html',
//                controller: 'ModalInstanceCtrl',
//                resolve: {
//                    items: function () {
//                        return $scope.items;
//                    }
//                }
//            });
//            modalInstance.result.then(function (selectedItem) {
//                $scope.selected = selectedItem;
//            }, function () {
//                //$log.info('Modal dismissed at: ' + new Date());
//            });
//
//        };
//
//        }]);
//
//Application.Controllers.controller('ModalInstanceCtrl',
//    ["$scope", '$modalInstance', "draft", function ($scope, $modalInstance, draft) {
//        $scope.selected = {
//            item: $scope.draft
//        };
//
//        $scope.ok = function () {
//            $modalInstance.close($scope.selected.item);
//        };
//
//        $scope.cancel = function () {
//            $modalInstance.dismiss('cancel');
//        };
//    }]);
