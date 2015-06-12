Application.Controllers.controller('setupInstanceController',
    ["$scope", "project", "$state","$log", "modal",  setupInstanceController]);

function setupInstanceController($scope, project, $state,  $log, modal) {
    $scope.modal = modal;
    $scope.selected = {
        item: {}
    };
    $scope.templates = ["Heat Treatment","Elasticity","Cogging","Heat Condition"];

    $scope.showDetails = function(template){
        $scope.template = template;
        $scope.selected.item = template;
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected.item);
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
