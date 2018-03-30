class MCExperimentNotesComponentController {
    /*@ngInject*/
    constructor($scope, $mdDialog, $stateParams, toast, editorOpts, experimentsAPI, toUITask) {
        $scope.editorOptions = editorOpts({height: 67, width: 59});
        this.experimentsAPI = experimentsAPI;
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.toUITask = toUITask;
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

    addTasks() {
        let newTask = {
            name: '',
            note: '',
            parent_id: '',
            index: this.experiment.tasks.length
        };
        this.experimentsAPI.createTask(this.projectID, this.experimentID, newTask)
            .then(
                (task) => {
                    this.toUITask(task);
                    this.experiment.tasks.push(task);
                    this.$mdDialog.show({
                        templateUrl: 'app/project/experiments/experiment/components/notes/quick-tasks.html',
                        controller: NewExperimentQuickTasksDialogController,
                        controllerAs: '$ctrl',
                        bindToController: true,
                        locals: {
                            task: task,
                            experiment: this.experiment
                        }
                    });
                }
            )

    }

    addNote() {
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
        this.experimentsAPI.updateNote(this.projectID, this.experimentID, note.id, {note: note.note})
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
    constructor($mdDialog, experimentsAPI, $stateParams, toast) {
        this.$mdDialog = $mdDialog;
        this.experimentsAPI = experimentsAPI;
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
            this.experimentsAPI.createNote(this.projectID, this.experimentID, note)
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

class NewExperimentQuickTasksDialogController {
    /*@ngInject*/
    constructor($mdDialog, toUITask, toast, taskService, experimentsAPI, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.toUITask = toUITask;
        this.taskService = taskService;
        this.experimentsAPI = experimentsAPI;
        this.$stateParams = $stateParams;
    }

    done() {
        this.$mdDialog.hide();
    }

    addAnother() {
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id,
            newTask = {
                name: '',
                note: '',
                parent_id: '',
                index: this.experiment.tasks.length
            };
        this.experimentsAPI.createTask(projectId, experimentId, newTask)
            .then(
                (task) => {
                    this.toUITask(task);
                    this.experiment.tasks.push(task);
                    this.task = task;
                },
                () => this.toast.error('Unable to create new task')
            );
    }

    toggleFlag(whichFlag, event) {
        this.taskService.toggleFlag(whichFlag, event, this.task);
    }

    toggleStar(event) {
        this.taskService.toggleStar(event, this.task);
    }

    onNameChange() {
        this.taskService.updateName(this.task);
    }

    selectedTemplate(templateId, processId) {
        this.taskService.setTemplate(templateId, processId, this.task);
    }

}

angular.module('materialscommons').component('mcExperimentNotes', {
    template: require('./mc-experiment-notes.html'),
    controller: MCExperimentNotesComponentController,
    bindings: {
        experiment: '='
    }
});

