class MCProjectHomeStatusNotesComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcProjectHomeStatusNotes', {
    templateUrl: 'app/project/home/mc-project-home-status-notes.html',
    controller: MCProjectHomeStatusNotesComponentController,
    bindings: {
        project: '<'
    }
});
