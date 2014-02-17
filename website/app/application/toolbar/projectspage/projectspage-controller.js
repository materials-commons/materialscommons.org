Application.Controllers.controller('toolbarProjectsPage',
    ["$scope", "$stateParams", "Stater", "mcapi", "$state", "watcher",
        function ($scope, $stateParams, Stater, mcapi, $state, watcher) {
            $scope.project_id = $stateParams.id;
            $scope.bk = {
                action: ''
            };
            watcher.watch($scope, 'bk.action', function (choice) {
                console.log("choice = '" + choice + "'");
                if (choice === 'prov') {
                    Stater.newId("prov", "create prov", "", function (status, state) {
                        if (status) {
                            $scope.state = state;
                            $scope.state.attributes.process = {};
                            //wizard.fireStep('nav_choose_process');
                            $state.go('toolbar.projectspage.provenance');
                        }
                    });

                }
            });
            $scope.init = function () {
                mcapi('/projects/%', $scope.project_id)
                    .success(function (project) {
                        $scope.project = project;
                        $state.go('toolbar.projectspage.overview');
                    }).jsonp();
            };

            $scope.init();
        }]);