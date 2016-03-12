(function (module) {
    module.component('mcProjectHome', {
       templateUrl: 'app/project/home/mc-project-home.html',
        controller: 'MCProjectHomeComponentController'
    });

    module.controller('MCProjectHomeComponentController', MCProjectHomeComponentController);
    MCProjectHomeComponentController.$inject = ['project'];

    function MCProjectHomeComponentController(project) {
        var ctrl = this;
        ctrl.project = project.get();
        ctrl.projectLoaded = true;
    }
}(angular.module('materialscommons')));
