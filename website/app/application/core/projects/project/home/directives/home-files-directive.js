Application.Directives.directive('homeFiles', homeFilesDirective);
function homeFilesDirective() {
    return {
        restrict: "A",
        controller: 'homeFilesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-files.html'
    };
}

Application.Controllers.controller("homeFilesDirectiveController",
                                   ["$scope", "ui", "projectFiles", "applySearch",
                                    "$filter", homeFilesDirectiveController]);
function homeFilesDirectiveController($scope, ui, projectFiles, applySearch,
                                      $filter) {
    $scope.files = projectFiles.model.projects[$scope.project.id].dir.children;
    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "files");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "files");
    };

    applySearch($scope, "searchInput", applyQuery);

    function applyQuery() {
        var search = {
            name: ""
        };

        if ($scope.searchInput === "") {
            $scope.files = projectFiles.model.projects[$scope.project.id].dir.children;
        } else {
            var filesToSearch = projectFiles.model.projects[$scope.project.id].byMediaType.all;
            search.name = $scope.searchInput;
            $scope.files = $filter('filter')(filesToSearch, search);
        }
    }
}
