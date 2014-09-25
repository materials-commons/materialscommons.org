Application.Controllers.controller('Projects',
                                   ["$scope", "$stateParams", "mcapi", "$state", "watcher",
                                    "ProjectPath", "pubsub", "model.projects", "$timeout",
                                    "$rootScope", "Tags", "User",  ProjectsController]);
function ProjectsController ($scope, $stateParams, mcapi, $state, watcher, ProjectPath, pubsub, Projects, $timeout, $rootScope, Tags, User) {
    $scope.project_id = $stateParams.id;
    $scope.model = {
        action: ''
    };
    pubsub.waitOn($scope, 'update_reviews.change', function() {
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
        });
    });
    watcher.watch($scope, 'model.action', function (choice) {
        if (choice === 'prov') {
            $state.go('projects.provenance');
        }
    });

    pubsub.waitOn($scope, 'active-action-close', function() {
        $scope.activeAction = "closed";
    });

    $scope.actionActivation = function (action) {

        if (action == $scope.activeAction) {
            $scope.activeAction = "closed";
        } else {
            $scope.activeAction = action;
        }
        pubsub.send("active-action", $scope.activeAction);
    };

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

    $scope.isActiveProject = function(index) {
        return index === $scope.colors.currentProjectIndex;
    };

    $scope.createName = function(name) {
        if (name.length > 15) {
            return name.substring(0,12)+"...";
        }
        return name;
    };

    function setProjectIndex(project_id, projects) {
        var i = _.indexOf(projects, function(project) {
            return project.id == project_id;
        });

        $scope.colors.setCurrentProjectIndex(i);
    }

    function init() {
        $scope.model = {
            name: ''
        };

        $scope.activeAction = "closed";
        $scope.from = ProjectPath.get_from();
        Projects.getList().then(function (projects) {
            $scope.model = {
                action: ''
            };
            $scope.projects = projects.slice(0,8);

            if (!($stateParams.id)) {
                $scope.project_id = $scope.projects[0].id;
            } else {
                $scope.project_id = $stateParams.id;
            }
            setProjectIndex($scope.project_id, projects);
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
