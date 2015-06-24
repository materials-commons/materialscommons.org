Application.Controllers.controller('setupInstanceController',
    ["$scope", "project", "$state","$log", "modal", "pubsub", "Template", setupInstanceController]);

function setupInstanceController($scope, project, $state,  $log, modal, pubsub, Template) {
    $scope.modal = modal;
    $scope.selected = {
        item: {}
    };
    var template = Template.getActiveTemplate();

    $scope.settings = template.settings;

    $scope.ok = function () {
        console.dir($scope.settings);
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
