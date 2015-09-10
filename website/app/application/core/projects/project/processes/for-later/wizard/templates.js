(function (module) {
    module.controller("chooseTemplateController", chooseTemplateController);
    chooseTemplateController.$inject = ["$scope", "templates"];

    function chooseTemplateController($scope, templates) {
        $scope.matchingTemplates = templates;
        $scope.searchInput = {
            name: ""
        };
        templates.forEach(function (template) {
            template.showDetails = false;
        });
    }
}(angular.module('materialscommons')));