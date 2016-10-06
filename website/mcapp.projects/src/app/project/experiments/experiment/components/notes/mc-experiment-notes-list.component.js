class MCExperimentNotesListComponentController {
    /*@ngInject*/
    constructor(notesService, $stateParams, toast) {
        this.treeOptions = {};
        this.notesService = notesService;
        this.toast = toast;
        this.projectID = $stateParams.project_id;
        this.experimentID = $stateParams.experiment_id;
        this.$onInit = () => {
            this.experiment = this.experimentNotes.experiment;
        };
    }

    setCurrent(note, event) {
        $('.mc-experiment-outline-task').removeClass('task-selected');
        $(event.currentTarget).addClass('task-selected');
        this.experimentNotes.currentNote = note;
    }

    onNameChange(note) {
        this.notesService.updateNote(this.projectID, this.experimentID, note.id, {name: note.name})
            .then(
                () => null,
                () => this.toast.error('Unable to update note name')
            );
    }
}

angular.module('materialscommons').component('mcExperimentNotesList', {
    templateUrl: 'app/project/experiments/experiment/components/notes/mc-experiment-notes-list.html',
    controller: MCExperimentNotesListComponentController,
    require: {
        experimentNotes: '^mcExperimentNotes'
    }
});
