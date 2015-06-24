Application.Controllers.controller('TemplateInstanceController',
    ["$scope", "project", "$state","$log", "modal","Template","processTemplates", TemplateInstanceController]);

function TemplateInstanceController($scope, project, $state,  $log, modal, Template, processTemplates) {
    $scope.modal = modal;
    this.all = project.processes;
    $scope.selected = {
        item: {}
    };

    $scope.showDetails = function(template){
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


    function init(){
        $scope.templates = processTemplates.templates();
    }
    init();
}
