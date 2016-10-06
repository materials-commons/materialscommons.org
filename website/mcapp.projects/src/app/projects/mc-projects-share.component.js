angular.module('materialscommons').component('mcProjectsShare', {
    templateUrl: 'app/projects/mc-projects-share.html',
    controller: MCProjectsShareComponentController
});

function MCProjectsShareComponentController(sharedProjectsList) {
    'ngInject';

    var ctrl = this;
    ctrl.sharedProjects = sharedProjectsList.get();
    ctrl.flexSize = 45;
    if (sharedProjectsList.count() === 3) {
        ctrl.flexSize = 30;
    }
}