Application.Controllers.controller('Projects',
                                   ["$scope", "$stateParams", "mcapi", "$state", "watcher",
                                    "ProjectPath", "pubsub", "model.projects", "$timeout",
                                    "$rootScope", "Tags", "User", ProjectsController]);
function ProjectsController ($scope, $stateParams, mcapi, $state, watcher, ProjectPath, pubsub, Projects, $timeout, $rootScope, Tags, User) {
    $scope.project_id = $stateParams.id;
    $scope.model = {
        action: ''
    };

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

    $scope.createProject = function(){
        if ($scope.bk.name === "") {
            return;
        }
        mcapi('/projects')
            .success(function (data) {
                Projects.getList(true).then(function(projects) {
                    $scope.projects = projects;
                });
            }).post({'name': $scope.bk.name});
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

    $scope.tagname = function(name) {
        if (name.length > 25) {
            return name.slice(0,22) + "...";
        }

        return name;
    };

    function init() {
        $scope.bk= {
            name: ''
        };

        $scope.activeAction = "closed";
        $scope.from = ProjectPath.get_from();
        Projects.getList().then(function (data) {
            $scope.model = {
                action: ''
            };
            $scope.projects = data.slice(0,8);

            if (!($stateParams.id)) {
                $scope.project_id = $scope.projects[0].id;
            } else {
                $scope.project_id = $stateParams.id;
            }

            if ($stateParams.draft_id !== "") {
                $state.go('projects.provenance.process');
            } else {
                $state.go('projects.overview.files', {id: $scope.project_id, draft_id: ''});
            }
        });
    }

    init();
}

Application.Controllers.controller('actionStackListController',
                                   ["$scope", "actionStackTracker", actionStackListController]);
function actionStackListController($scope, actionStackTracker) {
    $scope.actions = actionStackTracker.actions;
}
