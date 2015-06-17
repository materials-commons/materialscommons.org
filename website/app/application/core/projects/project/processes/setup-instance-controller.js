Application.Controllers.controller('setupInstanceController',
    ["$scope", "project", "$state","$log", "modal", "pubsub", setupInstanceController]);

function setupInstanceController($scope, project, $state,  $log, modal, pubsub) {
    $scope.modal = modal;
    $scope.selected = {
        item: {}
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected.item);
        pubsub.send('addSetupToSample', $scope.selected.item);
        $state.go('projects.project.processes.create');
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
