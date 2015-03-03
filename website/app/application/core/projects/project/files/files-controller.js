Application.Controllers.controller("FilesController",
    ["$scope", "projectFiles", "applySearch",
        "$filter", FilesController]);
function FilesController($scope, projectFiles, applySearch,
                         $filter) {
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    $scope.files = [f];

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
