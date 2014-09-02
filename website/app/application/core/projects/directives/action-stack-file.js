Application.Directives.directive('actionFile', actionFileDirective);

function actionFileDirective() {
    return {
        controller: "actionFileController",
        scope: {
            args: "@args"
        },
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-file.html"
    };
}

Application.Controllers.controller('actionFileController',
                                   ["$scope", "mcapi", "ProjectPath", "User", actionFileController]);

function actionFileController($scope, mcapi, ProjectPath, User) {

    function init() {
        $scope.id = $scope.args;
        mcapi('/datafile/%', $scope.id)
            .success(function (data) {
                $scope.file = data;
                $scope.trail = ProjectPath.get_trail();
                $scope.dir = ProjectPath.get_dir();
                $scope.fileType = "other";
                if (isImage($scope.file.name)) {
                    $scope.fileType = "image";
                }
                $scope.fileSrc = "datafiles/static/" + $scope.file.id + "?apikey=" + User.apikey();
                $scope.originalFileSrc = "datafiles/static/" + $scope.file.id + "?apikey=" + User.apikey() + "&download=true";
            }).jsonp();
    }

    init();
}
