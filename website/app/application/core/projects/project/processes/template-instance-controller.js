(function (module) {
    module.controller('TemplateInstanceController', TemplateInstanceController);
    TemplateInstanceController.$inject = ["$scope", "project", "$state", "$log",
        "modal", "processTemplates", "Review", "modalInstance"];

    function TemplateInstanceController($scope, project, $state, $log,
                                        modal, processTemplates, Review, modalInstance) {
        $scope.modal = modal;
        this.all = project.processes;
        $scope.selected = {
            item: {}
        };

        $scope.showDetails = function (template) {
            $scope.selected.item = template;
            $scope.template_details = processTemplates.newInstance(template);
        };

        $scope.viewSetUp = function (template) {
            $scope.template_details = processTemplates.newInstance(template);
            modalInstance.viewSetUp($scope.template_details.setup.settings[0].properties);
        };

        $scope.ok = function () {
            Review.resetCheckedItems();
            $scope.modal.instance.close($scope.selected.item);
            processTemplates.setActiveTemplate($scope.selected.item);
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


        function init() {
            $scope.templates = processTemplates.templates();
        }

        init();
    }
}(angular.module('materialscommons')));
