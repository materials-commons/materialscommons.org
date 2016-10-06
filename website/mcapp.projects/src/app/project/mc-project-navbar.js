angular.module('materialscommons').component("mcProjectNavbar", {
    templateUrl: 'app/project/mc-project-navbar.html',
    controller: MCProjectNavbarComponentController
});

/*@ngInject*/
function MCProjectNavbarComponentController(project, $state, $rootScope, $scope, $mdSidenav, quickbarSamples, $stateParams) {
    var ctrl = this;

    ctrl.showQuickbar = false;
    ctrl.currentTab = getCurrentTabIndex();
    ctrl.project = project.get();
    ctrl.projectSamples = [];
    ctrl.experimentSamples = [];
    ctrl.datasetSamples = [];

    var unregister = $rootScope.$on('$stateChangeSuccess', function() {
        ctrl.currentTab = getCurrentTabIndex();
    });

    $scope.$on('$destroy', function() { unregister(); });

    ctrl.toggleQuickbar = () => {
        ctrl.projectSamples = [];
        ctrl.experimentSamples = [];
        ctrl.datasetSamples = [];
        if (!$mdSidenav("quickbar").isOpen()) {
            ctrl.showQuickbar = true;
            quickbarSamples.getProjectSamples($stateParams.project_id)
                .then(
                    (samples) => ctrl.projectSamples = samples
                );
            if ($stateParams.experiment_id) {
                quickbarSamples.getExperimentSamples($stateParams.project_id, $stateParams.experiment_id)
                    .then(
                        (samples) => ctrl.experimentSamples = samples
                    );
            }
            if ($stateParams.dataset_id) {
                quickbarSamples.getDatasetSamples($stateParams.project_id, $stateParams.experiment_id, $stateParams.dataset_id)
                    .then(
                        (samples) => ctrl.datasetSamples = samples
                    );
            }
        } else {
            ctrl.showQuickbar = false;
        }
    };

    /////////////////////

    function getCurrentTabIndex() {
        if ($state.includes('project.home')) {
            return 0;
        } else if ($state.includes('project.experiments') || $state.includes('project.experiment')) {
            return 1;
        } else if ($state.includes('project.samples')) {
            return 2;
        } else if ($state.includes('project.files')) {
            return 3;
        } else if ($state.includes('project.settings')) {
            return 4;
        }

        return 0;
    }
}
