(function(module){
    module.component('mcProjectsShare', {
        templateUrl: 'projects/mc-projects-share.html',
        controller: 'MCProjectsShareComponentController'
    });
    module.controller('MCProjectsShareComponentController', MCProjectsShareComponentController);
    MCProjectsShareComponentController.$inject = ['sharedProjectsList'];
    function MCProjectsShareComponentController(sharedProjectsList) {
        var ctrl = this;
        ctrl.sharedProjects = sharedProjectsList.get();
        ctrl.flexSize = 45;
        if (sharedProjectsList.count() === 3) {
            ctrl.flexSize = 30;
        }
    }
}(angular.module('materialscommons')));
