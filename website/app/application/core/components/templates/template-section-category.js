(function (module) {
    module.directive("templateSectionCategory", [templateSectionCategoryDirective]);
    function templateSectionCategoryDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                category: "=category",
                edit: "=edit"
            },
            controller: "templateSectionCategoryDirectiveController",
            templateUrl: "application/core/components/templates/partials/sections/template-section-category.html"
        };
    }

    module.controller("templateSectionCategoryDirectiveController", templateSectionCategoryDirectiveController);
    templateSectionCategoryDirectiveController.$inject = ["$scope"];

    function templateSectionCategoryDirectiveController($scope) {
        $scope.searchInput = {
            name: ""
        };
    }
}(angular.module('materialscommons')));
