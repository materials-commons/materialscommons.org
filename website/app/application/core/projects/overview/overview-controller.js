Application.Controllers.controller('projectsOverview',
    ["$scope", "$stateParams", "pubsub", "$state","mcapi", function ($scope, $stateParams, pubsub, $state, mcapi) {
        $scope.countDrafts = function() {
            if ($scope.project_id === "") {
                return;
            }
            mcapi('/drafts/project/%', $scope.project_id)
                .success(function (drafts) {
                    $scope.drafts_count = drafts.length;
                }).jsonp();
        };

        $scope.showTab = function (tab) {
            switch (tab) {
                case "files":
                    $state.go('projects.overview.files');
                    break;
                case "provenance":
                    $state.go('projects.overview.provenance');
                    break;
                case "drafts":
                    $state.go('projects.overview.drafts');
                    break;
                case "samples":
                    $state.go('projects.overview.samples');
                    break;

            }
        };

        function init() {
            $scope.project_id = $stateParams.id;
            $scope.from = $stateParams.from;
            $scope.processes = [];
            $state.go('projects.overview.files', {id: $scope.project_id});
            $scope.countDrafts();
        }

        init();
    }]);
