class MCProjectNotesComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcProjectNotes', {
    template: require('./mc-project-notes.html'),
    controller: MCProjectNotesComponentController
});