Application.Controllers.controller('Projects',
    ["$scope", "$stateParams", "mcapi", "$state", "watcher", "ProjectPath",  "pubsub", "model.Projects",
        function ($scope, $stateParams, mcapi, $state, watcher, ProjectPath,  pubsub, Projects) {
            $scope.project_id = $stateParams.id;
            $scope.model = {
                action: ''
            };
            watcher.watch($scope, 'model.action', function (choice) {
                console.log("watch model.action choice = " + choice);
                if (choice === 'prov') {
                    $state.go('projects.provenance');
                }
            });

            function init() {
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
                    if ($stateParams.from === 'datafile') {
                        $scope.project_id = ProjectPath.get_project();
                        mcapi('/projects/%', $scope.project_id)
                            .success(function (project) {
                                $scope.project = project;
                            }).jsonp();
                    } else {
                        mcapi('/projects/%', $scope.project_id)
                            .success(function (project) {
                                $scope.project = project;
                                if ($stateParams.draft_id !== "") {
                                    $state.go('projects.provenance.process');
                                } else {
                                    $state.go('projects.overview.files', {id: $scope.project_id, draft_id: '', from: ''});
                                }
                            }).jsonp();
                    }
                });
            }

            init();
        }]);
