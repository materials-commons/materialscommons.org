class MCExperimentNotesComponentController {
    /*@ngInject*/
    constructor($scope, $mdDialog, notesService, $stateParams, toast, editorOpts) {
        $scope.editorOptions = editorOpts({height: 67, width: 59});

        this.notesService = notesService;
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.projectID = $stateParams.project_id;
        this.experimentID = $stateParams.experiment_id;
        if (this.experiment.notes.length) {
            this.experiment.notes.forEach((n) => n.selectedClass = '');
            this.currentNote = this.experiment.notes[0];
            this.currentNote.selectedClass = 'task-selected';
        } else {
            this.currentNote = null;
        }
    }

    addNote() {
        console.log('addNote');
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/notes/new-note-dialog.html',
            controller: NewExperimentNoteDialogController,
            controllerAs: 'ctrl',
            bindToController: true
        }).then(
            (note) => {
                this.setCurrent(note);
                this.experiment.notes.push(note);
                this.currentNote = note;
            }
        );
    }

    updateNote() {
        if (!this.projectID || !this.currentNote.id) {
            return;
        }

        if (!this.currentNote.note) {
            this.currentNote.note = '';
        }

        let note = this.currentNote;
        this.notesService.updateNote(this.projectID, this.experimentID, note.id, {note: note.note})
            .then(
                () => null,
                () => this.toast.error('Unable to update note')
            );
    }

    setCurrent(note) {
        $('.mc-experiment-outline-task').removeClass('task-selected');
        this.experiment.notes.forEach((n) => n.selectedClass = '');
        note.selectedClass = 'task-selected';
    }
}

class NewExperimentNoteDialogController {
    /*@ngInject*/
    constructor($mdDialog, notesService, $stateParams, toast) {
        this.$mdDialog = $mdDialog;
        this.notesService = notesService;
        this.toast = toast;
        this.projectID = $stateParams.project_id;
        this.experimentID = $stateParams.experiment_id;
        this.name = '';
    }

    submit() {
        if (this.name !== '') {
            let note = {
                name: this.name,
                note: `<h2>${this.name}</h2>`
            };
            this.notesService.createNote(this.projectID, this.experimentID, note)
                .then(
                    (n) => this.$mdDialog.hide(n),
                    () => this.toast.error('Failed to create note')
                );
        }
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcExperimentNotes', {
    templateUrl: 'app/project/experiments/experiment/components/notes/mc-experiment-notes.html',
    controller: MCExperimentNotesComponentController,
    bindings: {
        experiment: '='
    }
});

