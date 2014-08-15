Application.Controllers.controller('Projects',
    ["$scope", "$stateParams", "mcapi", "$state", "watcher", "ProjectPath", "pubsub", "model.Projects", "User",
        function ($scope, $stateParams, mcapi, $state, watcher, ProjectPath, pubsub, Projects, User) {
            $scope.project_id = $stateParams.id;
            $scope.model = {
                action: ''
            };
            watcher.watch($scope, 'model.action', function (choice) {
                if (choice === 'prov') {
                    $state.go('projects.provenance');
                }
            });
            $scope.createProject = function(){
                mcapi('/projects')
                    .success(function (data) {
                    }).post({'name': $scope.bk.name});
            }

            function init() {
                $scope.bk= {
                    name: ''
                }
                $scope.from = ProjectPath.get_from();
                Projects.getList().then(function (data) {
                    $scope.model = {
                        action: ''
                    };
                    $scope.projects = data;
                    if ($scope.projects.length === 0) {
                        return;
                    }
                    if (!($stateParams.id)) {
                        $stateParams.id = $scope.projects[0].id;
                    }
                    pubsub.send("project.tree", true);
                    $scope.project_id = $stateParams.id;

                    //tabset not preserving active project on page refresh
                    $scope.projects.forEach(function (item) {
                        if (item.id === $stateParams.id) {
                            item.active = true;
                        }
                        else {
                            item.active = false;
                        }
                    });
                    if ($stateParams.draft_id !== "") {
                        $state.go('projects.provenance.process');
                    } else {
                        $state.go('projects.overview.files', {id: $scope.project_id, draft_id: ''});
                    }
                });
            }

            init();
        }]);
