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
                                    "$filter",  "mcapi", homeFilesDirectiveController]);
function homeFilesDirectiveController($scope, ui, projectFiles, applySearch,
                                      $filter, mcapi) {
    $scope.files = projectFiles.model.projects[$scope.project.id].dir.children;
    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "files");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "files");
    };

    $scope.splitScreen = function(what, col){
        ui.toggleColumns(what, col, $scope.project.id);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

    $scope.isReloading = false;

    $scope.reloadFiles = function() {
        $scope.isReloading = !$scope.isReloading;

        mcapi("/projects/%/tree2", $scope.project.id)
            .success(function(files){
                var obj = {};
                obj.dir = files[0];
                projectFiles.model.projects[$scope.project.id] = obj;
                //projectFiles.loadByMediaType($scope.project);
                $scope.files = projectFiles.model.projects[$scope.project.id].dir.children;
                $scope.isReloading = false;
            }).jsonp();
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
