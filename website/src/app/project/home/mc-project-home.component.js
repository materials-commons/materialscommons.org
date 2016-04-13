angular.module('materialscommons').component('mcProjectHome', {
    templateUrl: 'app/project/home/mc-project-home.html',
    controller: MCProjectHomeComponentController
});

/*@ngInject*/
function MCProjectHomeComponentController(project, experimentsService, toast, $stateParams) {
    var ctrl = this;
    ctrl.project = project.get();
    ctrl.projectLoaded = true;
    ctrl.whichExperiments = 'active';

    ctrl.experiments = [];
    experimentsService.getAllForProject($stateParams.project_id).then(
        (experiments) => {
            ctrl.experiments = experiments;
        },
        () => toast.error('Unable to retrieve experiments for project')
    );
}
