angular.module('materialscommons').component('mcProjectHome', {
    templateUrl: 'app/project/home/mc-project-home.html',
    controller: MCProjectHomeComponentController
});

/*@ngInject*/
function MCProjectHomeComponentController($scope, project, experimentsService, toast,
                                          $stateParams, projectsService, editorOpts) {
    var ctrl = this;
    ctrl.project = project.get();
    ctrl.projectLoaded = true;
    ctrl.whichExperiments = 'active';
    ctrl.experiments = [];

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    experimentsService.getAllForProject($stateParams.project_id).then(
        (experiments) => ctrl.experiments = experiments,
        () => toast.error('Unable to retrieve experiments for project')
    );

    ctrl.updateProjectDescription = () => {
        if (ctrl.project.description === null) {
            ctrl.project.description = "";
        }

        projectsService.updateProject($stateParams.project_id, {description: ctrl.project.description})
            .then(
                () => null,
                () => toast.error('Unable to update project description')
            );
    };
}
