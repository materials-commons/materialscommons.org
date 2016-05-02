class MCExperimentNotesComponentController {
    /*@ngInject*/
    constructor($scope, $mdDialog) {
        $scope.editorOptions = {
            height: '67vh',
            width: '59vw',
            uiColor: '#f4f5f7'
        };
        this.$mdDialog = $mdDialog;
        if (this.experiment.notes.length) {
            this.currentNote = this.experiment.notes[0];
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
                this.experiment.notes.push(note);
                this.currentNote = note;
            }
        );
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

