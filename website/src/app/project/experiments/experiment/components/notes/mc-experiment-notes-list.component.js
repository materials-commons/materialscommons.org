class MCExperimentNotesListComponentController {
    /*@ngInject*/
    constructor() {
        this.treeOptions = {};
        this.$onInit = () => {
            this.experiment = this.experimentNotes.experiment;
        };
    }

    setCurrent(note, event) {
        $('.mc-experiment-outline-task').removeClass('task-selected');
        $(event.currentTarget).addClass('task-selected');
        this.experimentNotes.currentNote = note;
    }
}

angular.module('materialscommons').component('mcExperimentNotesList', {
    templateUrl: 'app/project/experiments/experiment/components/notes/mc-experiment-notes-list.html',
    controller: MCExperimentNotesListComponentController,
    require: {
        experimentNotes: '^mcExperimentNotes'
    }
});
