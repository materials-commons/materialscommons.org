Application.Directives.directive("templateSectionCategory", [templateSectionCategoryDirective]);
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

Application.Controllers.controller("templateSectionCategoryDirectiveController",
                                   ["$scope",
                                    templateSectionCategoryDirectiveController]);

function templateSectionCategoryDirectiveController($scope) {
    $scope.searchInput = {
        name: ""
    };
}
