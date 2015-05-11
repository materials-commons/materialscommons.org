Application.Directives.directive('modalFiles', modalFilesDirective);
function modalFilesDirective() {
    return {
        restrict: "A",
        controller: 'modalFilesDirectiveController',
        scope: {
            project: '=project'

        },
        templateUrl: 'application/core/projects/project/modal/files-modal.html'
    };
}

Application.Controllers.controller("modalFilesDirectiveController",
    ["$scope", "ui", "projectFiles", "applySearch",
        "$filter",  "mcapi", modalFilesDirectiveController]);
function modalFilesDirectiveController($scope, ui, projectFiles, applySearch,
                                      $filter, mcapi) {
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    f.showDetails = true;
    $scope.files = [f];
    $scope.files.showDetails = true;

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
