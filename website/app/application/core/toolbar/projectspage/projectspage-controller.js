Application.Controllers.controller('toolbarProjectsPage',
    ["$scope", "$stateParams", "mcapi", "$state", "watcher",
        function ($scope, $stateParams, mcapi, $state, watcher) {
            $scope.project_id = $stateParams.id;
            $scope.bk = {
                action: ''
            };

            watcher.watch($scope, 'bk.action', function (choice) {
                if (choice === 'prov') {
                    $state.go('toolbar.projectspage.provenance');
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