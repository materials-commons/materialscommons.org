(function(module) {
    module.component('mcProjects', {
        templateUrl: 'components/projects/mc-projects.html',
        controller: 'MCProjectsComponentController'
    });

    module.controller('MCProjectsComponentController', MCProjectsComponentController);
    MCProjectsComponentController.$inject = [];
    function MCProjectsComponentController() {
        var ctrl = this;
        ctrl.message = 'Hello from MCProjectsComponentController';
    }
}(angular.module('materialscommons')));
