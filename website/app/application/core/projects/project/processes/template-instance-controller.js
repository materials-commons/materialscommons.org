(function (module) {
    module.controller('TemplateInstanceController', TemplateInstanceController);
    TemplateInstanceController.$inject = ["$scope", "project", "$state", "$log",
        "modal", "processTemplates", "Review", "modalInstance"];

    function TemplateInstanceController($scope, project, $state, $log,
                                        modal, processTemplates, Review, modalInstance) {
        $scope.modal = modal;
        this.all = project.processes;

        $scope.showDetails = function (template) {
            $scope.selected.item = template;
            $scope.template_details = processTemplates.newInstance(template);
        };

        $scope.viewSetUp = function (template) {
            $scope.template_details = processTemplates.newInstance(template);
            modalInstance.viewSetUp($scope.template_details.setup.settings[0].properties);
        };

        $scope.preFill = function (template) {
            $scope.showDetails(template);
            //$scope.modal.instance.close();
            modalInstance.preFill($scope.template_details);

            //processTemplates.setActiveTemplate(template);
            //$state.go('projects.project.processes.prefill');
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

        $scope.setActive = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.addToFavourite = function (template) {
            $scope.favourites.push(template);
            var index = _.indexOf($scope.templates, function (item) {
                return item.name === template.name;
            });
            if (index > -1) {
                $scope.templates[index].isFavorite = true;
            }
        };

        $scope.isActive = function (tab) {
            return $scope.activeTab === tab;
        };

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });


        function init() {
            $scope.templates = processTemplates.templates();
            $scope.setActive('all');
            $scope.favourites = [];
            $scope.selected = {
                item: {}
            };
        }

        init();
    }
}(angular.module('materialscommons')));
