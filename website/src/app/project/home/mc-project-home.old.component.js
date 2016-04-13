angular.module('materialscommons').component('mcProjectHome', {
    templateUrl: 'app/project/home/mc-project-home.old.html',
    controller: MCProjectHomeOldComponentController
});

/*@ngInject*/
function MCProjectHomeOldComponentController(project) {
    var ctrl = this;
    ctrl.project = project.get();
    ctrl.projectLoaded = true;
}