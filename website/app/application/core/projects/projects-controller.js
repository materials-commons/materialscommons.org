Application.Controllers.controller('Projects',
                                   ["$scope", "mcapi", "model.projects", ProjectsController]);
function ProjectsController ($scope, mcapi, Projects) {
    $scope.createProjects = function(){
        if ($scope.model.name === "") {
            return;
        }
        mcapi('/projects')
            .success(function (data) {
                Projects.getList(true).then(function(projects) {
                    $scope.projects = projects;
                });
            }).post({'name': $scope.model.name});
    };

    $scope.isActiveProject = function(id) {
        return id === $scope.colors.currentProjectID;
    };

    $scope.createName = function(name) {
        if (name.length > 15) {
            return name.substring(0,12)+"...";
        }
        return name;
    };

    function init() {
        $scope.model = {
            name: ''
        };

        Projects.getList().then(function (projects) {
            $scope.colors.setProjectIDs(projects);
            $scope.projects = projects.slice(0,8);
        });
    }
    init();
}

Application.Controllers.controller('actionStackListController',
                                   ["$scope", "actionStackTracker", actionStackListController]);
function actionStackListController($scope, actionStackTracker) {
    $scope.actions = actionStackTracker.actions;
    $scope.actionActive = actionStackTracker.actionActive;
}
