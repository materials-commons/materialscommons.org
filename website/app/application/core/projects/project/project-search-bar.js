Application.Directives.directive('projectSearchBar', projectSearchBarDirective);

function projectSearchBarDirective() {
    return {
        scope: {
            project: "="
        },
        controller: "projectSearchBarDirectiveController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/project-search-bar.html"
    };
}

Application.Controllers.controller("projectSearchBarDirectiveController",
                                   ["$scope", projectSearchBarDirectiveController]);

function projectSearchBarDirectiveController($scope) {
    $scope.showSearchControls = false;
    $scope.searchType = "All";
}
