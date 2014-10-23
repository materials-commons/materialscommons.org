Application.Controllers.controller("homeFilesController",
    ["$scope",  function ($scope) {

        function init() {
            $scope.projectSize = bytesToSizeStr($scope.project.size);
            var totalFiles = 0, key;
            for (key in $scope.project.mediatypes) {
                totalFiles += $scope.project.mediatypes[key].count;
            }
            $scope.fileCount = numberWithCommas(totalFiles);

        }

        init();
    }]);
Application.Directives.directive('homeFiles',
    function () {
        return {
            restrict: "A",
            controller: 'homeFilesController',
            scope: {
                project: '=project'
            },
            templateUrl: 'application/directives/home-files.html'
        };
    });
