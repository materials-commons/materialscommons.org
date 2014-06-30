Application.Controllers.controller('toolbarProjectsPage',
    ["$scope", "$stateParams", "mcapi", "$state", "watcher", "ProjectPath",  "pubsub", "model.Projects",
        function ($scope, $stateParams, mcapi, $state, watcher, ProjectPath,  pubsub, Projects) {

            $scope.project_id = $stateParams.id;
            $scope.model = {
                action: ''
            };
            watcher.watch($scope, 'model.action', function (choice) {
                if (choice === 'prov') {
                    $state.go('toolbar.projectspage.provenance');
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
                    if ($stateParams.from === 'datafile') {
                        $scope.project_id = ProjectPath.get_project();
                        mcapi('/projects/%', $scope.project_id)
                            .success(function (project) {
                                $scope.project = project;
                            }).jsonp();
                    }
//                    else if($stateParams.from === 'review'){
////                        console.log('yes')
////                        $state.go('toolbar.projectspage.reviews');
//
//                    }else if($stateParams.from === 'machine'){
//                        $state.go('toolbar.projectspage.machines');
//                    }

                    else {
                        mcapi('/projects/%', $scope.project_id)
                            .success(function (project) {
                                $scope.project = project;
                                if ($stateParams.draft_id !== "") {
                                    $state.go('toolbar.projectspage.provenance.process');
                                } else {
                                    $state.go('toolbar.projectspage.overview.files', {id: $scope.project_id, 'draft_id': '', from: ''});
                                }
                            }).jsonp();
                    }
                });
            }

            init();
        }]);