(function(module) {
    module.component('mcProject', {
        templateUrl: 'components/project/mc-project.html',
        controller: 'MCProjectComponentController',
        scope: {
            project: '='
        }
    });

    module.controller('MCProjectComponentController', MCProjectComponentController);
    MCProjectComponentController.$inject = ["projectsService", "$stateParams"];
    function MCProjectComponentController(projectsService, $stateParams) {
        var ctrl = this;

        projectsService.getProject($stateParams.project_id).then(function(p) {
            ctrl.project = p;
        });

        ctrl.showSidebar = true;
        ctrl.toggle = toggle;

        closeAll();
        ctrl.samplesOpen = true;

        ////////////////////////////////////////

        function toggle(what) {
            var current = ctrl[what];
            closeAll();
            ctrl[what] = !current;
        }

        function closeAll() {
            ctrl.treeOpen = false;
            ctrl.samplesOpen = false;
            ctrl.filesOpen = false;
            ctrl.processesOpen = false;
            ctrl.sharesOpen = false;
            ctrl.datasetsOpen = false;
        }
    }
}(angular.module('materialscommons')));
