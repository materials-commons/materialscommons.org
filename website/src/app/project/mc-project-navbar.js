angular.module('materialscommons').component("mcProjectNavbar", {
    templateUrl: 'app/project/mc-project-navbar.html',
    controller: MCProjectNavbarComponentController
});

/*@ngInject*/
function MCProjectNavbarComponentController($state, $rootScope, $scope, $mdSidenav, ProjectModel, $mdDialog, toast,
                                            projectsAPI, experimentsAPI, quickbarSamples, $stateParams, User, mcprojstore) {
    const ctrl = this;

    ctrl.showQuickbar = false;
    ctrl.currentTab = getCurrentTabIndex();
    ctrl.project = mcprojstore.getProject($stateParams.project_id);
    ctrl.projectName = ctrl.project.name;
    ctrl.projectSamples = [];
    ctrl.experimentSamples = [];
    ctrl.datasetSamples = [];
    ctrl.isBetaUser = User.attr().beta_user;
    ctrl.user = User.u();

    const unregister = $rootScope.$on('$stateChangeSuccess', function() {
        ctrl.currentTab = getCurrentTabIndex();
    });

    $scope.$on('$destroy', function() {
        unregister();
    });

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

    ctrl.refreshProject = () => {
        ProjectModel.getProjectForCurrentUser($stateParams.project_id).then((p) => _updateProjectExperiments(p));
    };

    ctrl.deleteProject = () => {
        let deleteDialog = $mdDialog.confirm()
            .title(`Delete project: ${ctrl.project.name}`)
            .textContent('Deleting a project is a permanent operation - all information with the project will be removed.')
            .ariaLabel('Delete Project')
            .ok('Delect Project')
            .cancel('cancel');

        $mdDialog.show(deleteDialog).then(
            () => {
                projectsAPI.deleteProject(ctrl.project.id).then(
                    () => mcprojstore.removeCurrentProject().then(() => $state.go('projects.list')),
                    () => toast.error('Failed to delete project')
                )
            }
        );
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
        } else if ($state.includes('project.dashboard')) {
            return 5;
        }

        return 0;
    }

    function _updateProjectExperiments(project) {
        mcprojstore.updateCurrentProject((currentProject, transformers) => {
            let transformedExperiments = project.experiments.map(e => transformers.transformExperiment(e));
            project.experiments = _.indexBy(transformedExperiments, 'id');
            project.experimentsFullyLoaded = true;
            currentProject = project;
        });
    }
}
