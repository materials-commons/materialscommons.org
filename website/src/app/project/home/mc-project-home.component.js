angular.module('materialscommons').component('mcProjectHome', {
    templateUrl: 'app/project/home/mc-project-home.html',
    controller: MCProjectHomeComponentController
});

function MCProjectHomeComponentController(project) {
    'ngInject';

    var ctrl = this;
    ctrl.project = project.get();
    ctrl.projectLoaded = true;
}