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

    function setupMediatypeAttrs() {
        // Count the total number of files, and put the
        // mediatypes in an array that we can use normal
        // angularjs filters on (since things like orderBy)
        // won't work on a hash. Do this in a single loop
        // to keep from having to go through the dictionary
        // more than once.
        var totalFiles = 0;
        $scope.mediatypes = [];
        for (var key in $scope.project.mediatypes) {
            var o = {
                name: key,
                attrs: $scope.project.mediatypes[key]
            };
            $scope.mediatypes.push(o);
            totalFiles += $scope.project.mediatypes[key].count;
        }
        $scope.fileCount = totalFiles;
    }

    setupMediatypeAttrs();
}
