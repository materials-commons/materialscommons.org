angular.module('materialscommons').component('mcExperimentNotes', {
    templateUrl: 'app/project/experiments/experiment/components/notes/mc-experiment-notes.html',
    controller: MCExperimentNotesComponentController,
    bindings: {
        experiment: '='
    }
});

class MCExperimentNotesComponentController {
    /*@ngInject*/
    constructor($scope) {
        $scope.editorOptions = {};
    }

    addNote() {

    }
}
