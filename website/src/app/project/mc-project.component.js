angular.module('materialscommons')
    .component('mcProject', {
        templateUrl: 'app/project/mc-project.html',
        controller: MCProjectComponentController
    });

function MCProjectComponentController(projectsAPI, $stateParams, mcstate) {
    'ngInject';

    const ctrl = this;

    ctrl.showQuickbar = false;
    ctrl.toggle = toggle;
    ctrl.openTree = openTree;
    ctrl.openFiles = openFiles;

    closeAll();

    projectsAPI.getProject($stateParams.project_id).then(function(p) {
        mcstate.set(mcstate.CURRENT$PROJECT, p);
        ctrl.project = p;
    });

    ////////////////////////////////////////

    function toggle(what) {
        const current = ctrl[what];
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
