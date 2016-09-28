angular.module('materialscommons').component('mcExperimentTasks', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-tasks.html',
    controller: MCExperimentTasksComponentController
});

/*@ngInject*/
function MCExperimentTasksComponentController($scope, moveTask, currentTask, currentExperiment, currentNode,
                                              blankTaskService, $mdDialog) {
    let ctrl = this;
    ctrl.show = 'note';

    ctrl.filterBy = {flags: {done: false}};

    ctrl.$onInit = () => {
        ctrl.currentNode = null;
        ctrl.experiment = currentExperiment.get();
        ctrl.experiment.tasks[0].displayState.selectedClass = 'task-selected';
        currentTask.set(ctrl.experiment.tasks[0]);
        ctrl.currentTask = currentTask.get();
        currentTask.setOnChange(() => ctrl.currentTask = currentTask.get());
    };

    ctrl.addTask = () => {
        let node = currentNode.get(),
            task = currentTask.get();
        blankTaskService.addBlankTask(node, task);
    };

    ctrl.addQuickNote = () => {
        $mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/tasks/quick-note-dialog.html',
            controller: CreateExperimentQuickNoteDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                experiment: ctrl.experiment
            }
        });
    };

    ctrl.toggleFilter = (filter, event) => {
        let setFlag = false;
        if (_.has(ctrl.filterBy.flags, filter)) {
            // The done flag is treated specially as, by default, we don't show
            // done items.
            if (filter === 'done') {
                ctrl.filterBy.flags.done = !ctrl.filterBy.flags.done;
                setFlag = ctrl.filterBy.flags.done;
            } else {
                delete ctrl.filterBy.flags[filter];
            }
        } else {
            setFlag = true;
            ctrl.filterBy.flags[filter] = true;
        }

        switch (filter) {
            case "done":
                toggleFilterIcon(setFlag, event, 'fa-check-square', 'fa-check-square-o');
                break;
            case "starred":
                toggleFilterIcon(setFlag, event, 'fa-star', 'fa-star-o');
                break;
            case "flagged":
                toggleFilterIcon(setFlag, event, 'fa-flag', 'fa-flag-o');
                break;
        }
    };

    function toggleFilterIcon(isSet, event, setClass, unsetClass) {
        if (isSet) {
            $(event.target).removeClass(unsetClass);
            $(event.target).addClass(setClass);
        } else {
            $(event.target).removeClass(setClass);
            $(event.target).addClass(unsetClass);
        }
    }

    ctrl.moveLeft = () => moveTask.left(ctrl.currentNode, currentTask.get(), ctrl.experiment);
    ctrl.moveRight = () => moveTask.right(ctrl.currentNode, currentTask.get());
    ctrl.moveUp = () => moveTask.up(ctrl.currentNode, currentTask.get());
    ctrl.moveDown = () => moveTask.down(ctrl.currentNode, currentTask.get(), ctrl.experiment);
    ctrl.expandAll = () => $scope.$broadcast('angular-ui-tree:expand-all');
    ctrl.collapseAll = () => $scope.$broadcast('angular-ui-tree:collapse-all');
    ctrl.showTaskMaximized = () => {
        if (!currentTask.get()) {
            return false;
        }
        return currentTask.get().displayState.maximize;
    };
    ctrl.getCurrentTask = () => currentTask.get();
}

class CreateExperimentQuickNoteDialogController {

    /*@ngInject*/
    constructor($mdDialog, $scope, editorOpts, notesService, $stateParams, toast) {
        this.$mdDialog = $mdDialog;
        $scope.editorOptions = editorOpts({height: 40, width: 55});
        this.note = {
            name: " ",
            note: " "
        };
        this.noteCreated = false;
        this.noteId = "";
        this.notesService = notesService;
        this.$stateParams = $stateParams;
        this.toast = toast;
    }

    /*
     * updateNote uses this.noteCreated to determine if the note needs to be created rather than updated.
     * If the note is in the process of being created then this.noteId will equal "", and an update to the
     * note will not occur. Once it has been created updates will start being made to the note.
     */
    updateNote() {
        let projectId = this.$stateParams.project_id,
            experimentId = this.$stateParams.experiment_id,
            note = {
                note: this.note.note ? this.note.note : " ",
                name: this.note.name ? this.note.name : " "
            };
        if (!this.noteCreated) {
            this.notesService.createNote(projectId, experimentId, note)
                .then(
                    (n) => {
                        this.noteId = n.id;
                        this.note = n;
                        this.noteCreated = true;
                        this.experiment.notes.push(n);
                    },
                    () => this.toast.error('Failed to create note')
                );
        } else if (this.noteId !== "") {
            this.notesService.updateNote(projectId, experimentId, this.noteId, note)
                .then(
                    () => null,
                    () => this.toast.error('Unable to update note')
                );
        }
    }

    done() {
        this.$mdDialog.hide();
    }
}

