Application.Controllers.controller('Projects',
                                   ["$scope", "$stateParams", "mcapi", "$state", "watcher",
                                    "ProjectPath", "pubsub", "model.projects", "$timeout",
                                    "$rootScope", "Tags", "User", ProjectsController]);
function ProjectsController ($scope, $stateParams, mcapi, $state, watcher, ProjectPath, pubsub, Projects, $timeout, $rootScope, Tags, User) {
    $scope.project_id = $stateParams.id;
    $scope.model = {
        action: ''
    };

    $scope.myOnClick = function(index) {
        console.log("---- myOnClick----");
        console.log("  index = " + index);
        $scope.colors.setCurrentProjectIndex(index);
        console.log("---- end myOnClick----");
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
        //console.log("isActiveProject == " + index + "/" + $scope.colors.currentProjectIndex);
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
        console.log("projects page controller");
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

            // console.log("--start goto projects.overview --");
            // console.dir($stateParams);
            // console.log("-- end goto projects.overview --");
            var index = $stateParams.index ? $stateParams.index : 0;
            // console.log("Using index = " + index);
            $scope.colors.setCurrentProjectIndex(index);
            $state.go('projects.overview', {id: $scope.project_id, draft_id: '', index: index});
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
