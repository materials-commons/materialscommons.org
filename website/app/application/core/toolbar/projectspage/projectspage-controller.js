Application.Controllers.controller('toolbarProjectsPage',
    ["$scope", "$stateParams", "mcapi", "$state", "watcher", "ProjectPath", "Nav","pubsub",
        function ($scope, $stateParams, mcapi, $state, watcher, ProjectPath, Nav, pubsub) {

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
                pubsub.send("project.tree", true);
                $scope.project_id = $stateParams.id;
                $scope.model = {
                    action: ''
                };
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
                                $state.go('toolbar.projectspage.provenance.process');
                            } else {
                                $state.go('toolbar.projectspage.overview', {id: $scope.project_id, 'draft_id': '', from: ''});
                            }
                        }).jsonp();
                }
                Nav.setActiveNav('Projects');
                mcapi('/projects/%', $scope.project_id)
                    .success(function (project) {
                        $scope.project = project;
                        if ($stateParams.draft_id !== "") {
                            $state.go('toolbar.projectspage.provenance');
                        } else {
                            $state.go('toolbar.projectspage.overview', {id: $scope.project_id, 'draft_id': ''});
                        }
                    }).jsonp();

            }
            init();
        }]);