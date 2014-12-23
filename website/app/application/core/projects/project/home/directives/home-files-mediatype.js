Application.Directives.directive('homeFilesMediatype', homeFilesMediatypeDirective);
function homeFilesDirective() {
    return {
        restrict: "A",
        controller: 'homeFilesMediatypeDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-files-mediatype.html'
    };
}

Application.Controllers.controller("homeFilesMediatypeDirectiveController",
                                   ["$scope", "$state", "listParams", "searchParams", "ui",
                                    homeFilesMediatypeDirectiveController]);
function homeFilesMediatypeDirectiveController($scope, $state, listParams, searchParams, ui) {
    $scope.showMediaType = function(mediatype, mediaTypeDescription) {
        listParams.set("file-list", "mediatype", mediatype,
                       "File type:" + mediaTypeDescription);
        searchParams.clear("file-list");
        $state.go("projects.project.files.list");
    };

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "files");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "files");
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
