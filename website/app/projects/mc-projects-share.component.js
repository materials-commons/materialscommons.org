(function(module){
    module.component('mcProjectsShare', {
        templateUrl: 'projects/mc-projects-share.html',
        controller: 'MCProjectsShareComponentController'
    });
    module.controller('MCProjectsShareComponentController', MCProjectsShareComponentController)
    MCProjectsShareComponentController.$inject = ['sharedProjectsList'];
    function MCProjectsShareComponentController(sharedProjectsList) {
        var ctrl = this;
        ctrl.sharedProjects = sharedProjectsList.get();
    }
}(angular.module('materialscommons')));
