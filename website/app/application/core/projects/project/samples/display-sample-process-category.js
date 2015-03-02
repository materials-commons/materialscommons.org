Application.Directives.directive("displaySampleProcessCategory", [displaySampleProcessCategoryDirective]);
function displaySampleProcessCategoryDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            process: "=process",
            edit: "=edit"
        },
        controller: "displaySampleProcessCategoryDirectiveController",
        templateUrl: "application/core/projects/project/samples/display-sample-process-category.html"
    };
}

Application.Controllers.controller("displaySampleProcessCategoryDirectiveController",
                                   ["$scope",
                                    displaySampleProcessCategoryDirectiveController]);

function displaySampleProcessCategoryDirectiveController($scope) {
    $scope.searchInput = {
        name: ""
    };
}
