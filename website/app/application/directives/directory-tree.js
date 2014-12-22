Application.Directives.directive('directoryTree', directoryTreeDirective);

function directoryTreeDirective() {
    return {
        restrict: "E",
        controller: 'directoryTreeController',
        scope: {
            project: '=project'
        },
        replace: true,
        templateUrl: 'application/directives/directory-tree.html'
    };
}

Application.Controllers.controller("directoryTreeController",
                                   ["$scope", "projectFiles", "$debounce", "watcher",
                                    "$filter",
                                    directoryTreeController]);

function directoryTreeController($scope, projectFiles, $debounce, watcher, $filter) {
    $scope.files = projectFiles.model.projects[$scope.project.id].dir.children;
    $scope.files.forEach(function(f) {
        f.showDetails = false;
    });

    $scope.toggleDetails = function(file) {
        file.showDetails = !file.showDetails;
    };

    $scope.showDetails = function(file) {
        return file.showDetails;
    };

    var search = {
        name: ""
    };

    watcher.watch($scope, "searchInput", function(s) {
        if (search.name === s) {
            return;
        }
        $debounce(applyQuery, 350);
    });

    function applyQuery() {
        if ($scope.searchInput === "") {
            $scope.files = projectFiles.model.projects[$scope.project.id].dir.children;
        } else {
            var filesToSearch = projectFiles.model.projects[$scope.project.id].byMediaType.all;
            search.name = $scope.searchInput;
            $scope.files = $filter('filter')(filesToSearch, search);
        }
    }
}
