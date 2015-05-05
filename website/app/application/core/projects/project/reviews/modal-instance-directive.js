Application.Directives.directive('modalInstance', modalInstanceDirective);

function modalInstanceDirective() {
    return {
        scope: {
            project: '=project',
            modal: "="
        },
        controller: 'ModalInstanceCtrl',
        restrict: "AE",
        templateUrl: "application/core/projects/project/reviews/myModalContent.html"
    };
}

Application.Controllers.controller('ModalInstanceCtrl',
    ["$scope", "$log",ModalInstanceCtrl]);

function ModalInstanceCtrl($scope, $log) {
    $scope.selected = {
        item: $scope.modal.items[0]
    };

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
