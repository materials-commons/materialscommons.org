Application.Controllers.controller('TemplateInstanceController',
    ["$scope", "project", "$state","$log", "modal","Template", "mcapi", TemplateInstanceController]);

function TemplateInstanceController($scope, project, $state,  $log, modal, Template, mcapi) {
    $scope.modal = modal;
    this.all = project.processes;
    $scope.selected = {
        item: {}
    };

    $scope.templates = ["Heat Treatment","Elasticity","Cogging","Heat Condition"];

    mcapi("/templates")
        .success(function(templates){
          $scope.templates = templates;
        }).jsonp();

    $scope.showDetails = function(template){
        $scope.template = template;
        $scope.selected.item = template;
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected.item);
        Template.setActiveTemplate($scope.selected.item);
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
