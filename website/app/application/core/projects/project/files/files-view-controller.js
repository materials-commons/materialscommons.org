Application.Controllers.controller("projectFileView",
    ["$scope", "model.projects", "$stateParams", "User", "ProjectPath", "pubsub", projectFileView]);

function projectFileView($scope, Projects, $stateParams,User, ProjectPath, pubsub) {

//    pubsub.waitOn($scope, "update_dir", function () {
//        $scope.getImages();
//    });

    $scope.expand = function (df) {
        $scope.datafile = df;
    }

    $scope.getImages = function () {
        $scope.apikey = User.apikey();
        $scope.datafiles = ProjectPath.get_dir();
    }

    function init() {
        Projects.get($stateParams.id).then(function (project) {
            $scope.project = project;
        });
    }
    init();
}
