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
                                    "$filter", "mcFlow", "pubsub", "$timeout",
                                    homeFilesDirectiveController]);
function homeFilesDirectiveController($scope, ui, projectFiles, applySearch,
                                      $filter, mcFlow, pubsub, $timeout) {
    $scope.files = projectFiles.model.projects[$scope.project.id].dir.children;
    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "files");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "files");
    };

    applySearch($scope, "searchInput", applyQuery);

    pubsub.waitOn($scope, "file-upload-added", function() {
        console.log("got file-upload-added");
        $timeout(function() {
            console.dir(flow.files);
            $scope.uploads = flow.files;
        });
    });

    var flow = mcFlow.get();
    $scope.uploads = flow.files;

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
