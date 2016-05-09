angular.module('materialscommons').component('mcProjectHome', {
    templateUrl: 'app/project/home/mc-project-home.html',
    controller: MCProjectHomeComponentController
});

/*@ngInject*/
function MCProjectHomeComponentController($scope, project, experimentsService, toast,
                                          $stateParams, projectsService, editorOpts) {
    console.log('MCProjectHomeComponentController');
    var ctrl = this;
    ctrl.project = project.get();
    ctrl.projectLoaded = true;
    ctrl.whichExperiments = 'active';
    ctrl.experiments = [];
    let projectDescription = ctrl.project.description;

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    experimentsService.getAllForProject($stateParams.project_id).then(
        (experiments) => ctrl.experiments = experiments,
        () => toast.error('Unable to retrieve experiments for project')
    );

    ctrl.updateProjectDescription = () => {
        if (projectDescription === ctrl.project.description) {
            return;
        }

        if (ctrl.project.description === null) {
            return;
        }

        projectsService.updateProject($stateParams.project_id, {description: ctrl.project.description})
            .then(
                () => projectDescription = ctrl.project.description,
                () => toast.error('Unable to update project description')
            );
    };
}
