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
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    f.showDetails = true;
    $scope.files = [f];
    $scope.files.showDetails = true;

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "files");
    };

    $scope.minimize = function() {
        ui.togglePanelState($scope.project.id, 'files')
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "files");
    };

    $scope.splitScreen = function(what, col){
        ui.toggleColumns($scope.project.id, what, col)
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
                // obj.dir is root of project. Have it opened by default.
                obj.dir.showDetails = true;
                $scope.files = [projectFiles.model.projects[$scope.project.id].dir];
                projectFiles.loadByMediaType($scope.project);
                $scope.isReloading = false;
            }).jsonp();
    };

    applySearch($scope, "searchInput", applyQuery);

    function applyQuery() {
        var search = {
            name: ""
        };

        if ($scope.searchInput === "") {
            $scope.files = [projectFiles.model.projects[$scope.project.id].dir];
        } else {
            var filesToSearch = projectFiles.model.projects[$scope.project.id].byMediaType.all;
            search.name = $scope.searchInput;
            $scope.files = $filter('filter')(filesToSearch, search);
        }
    }
}
