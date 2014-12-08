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
                                   ["$scope", "$state", "listParams", "searchParams",
                                    homeFilesDirectiveController]);
function homeFilesDirectiveController($scope, $state, listParams, searchParams) {
    $scope.showMediaType = function(mediatype) {
        listParams.set("file-list", "mediatype", mediatype);
        searchParams.clear("file-list");
        $state.go("projects.project.files.list");
    };

    var totalFiles = 0;
    for (var key in $scope.project.mediatypes) {
        totalFiles += $scope.project.mediatypes[key].count;
    }
    $scope.fileCount = totalFiles;
}
