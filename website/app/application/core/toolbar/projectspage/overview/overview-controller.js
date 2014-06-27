Application.Controllers.controller('toolbarProjectsPageOverview',
    ["$scope", "$stateParams", "pubsub", "$state", function ($scope, $stateParams, pubsub, $state) {

        $scope.showTab = function (tab) {
            switch (tab) {
                case "files":
                    $state.go('toolbar.projectspage.overview.files');
                    break;
                case "provenance":
                    $state.go('toolbar.projectspage.overview.provenance');
                    break;
                case "drafts":
                    $state.go('toolbar.projectspage.overview.drafts');
                    break;
//                case "issues":
//                    $state.go('toolbar.projectspage.overview.issues');
//                    break;
//                case "settings":
//                    $state.go('toolbar.projectspage.overview.settings');
//                    break;
                case "samples":
                    $state.go('toolbar.projectspage.overview.samples');
                    break;

            }
        };

        function init() {
            $scope.project_id = $stateParams.id;
            $scope.from = $stateParams.from;
            $scope.processes = [];
            $state.go('toolbar.projectspage.overview.files', {id: $scope.project_id});
        }

        init();
    }]);