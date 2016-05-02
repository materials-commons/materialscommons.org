class MCExperimentNotesListComponentController {
    /*@ngInject*/
    constructor(currentExperiment) {
        this.treeOptions = {};
        this.experiment = currentExperiment.get();
    }
}

angular.module('materialscommons').component('mcExperimentNotesList', {
    templateUrl: 'app/project/experiments/experiment/components/notes/mc-experiment-notes-list.html',
    controller: MCExperimentNotesListComponentController
});
