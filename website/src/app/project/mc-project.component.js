angular.module('mc.project')
    .component('mcProject', {
        templateUrl: 'app/project/mc-project.html',
        controller: MCProjectComponentController
    });

function MCProjectComponentController(projectsService, $state, $stateParams, project) {
    'ngInject';
    var ctrl = this;

    ctrl.showSidebar = true;
    ctrl.toggle = toggle;
    ctrl.openTree = openTree;
    ctrl.openFiles = openFiles;

    closeAll();

    projectsService.getProject($stateParams.project_id).then(function(p) {
        project.set(p);
        ctrl.project = p;
    });

    ////////////////////////////////////////

    function toggle(what) {
        var current = ctrl[what];
        closeAll();
        ctrl[what] = !current;
    }

    function closeAll() {
        ctrl.samplesOpen = false;
        ctrl.processesOpen = false;
        ctrl.sharesOpen = false;
        ctrl.datasetsOpen = false;
        ctrl.filesOpen = false;
    }

    function openTree() {

    }

    function openFiles() {
        toggle('filesOpen');
        //closeAll();
        //$state.go('project.files');
    }
}
