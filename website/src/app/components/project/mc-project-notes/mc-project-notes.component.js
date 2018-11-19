class MCProjectNotesComponentController {
    /*@ngInject*/
    constructor(mcStateStore, projectsAPI, toast) {
        this.mcStateStore = mcStateStore;
        this.projectsAPI = projectsAPI;
        this.toast = toast;
    }

    $onInit() {
        this.project = this.mcStateStore.getState('project');
        this.projectsAPI.getProjectNotes(this.project.id).then(
            notes => {
                this.project.notes = notes;
                this.project.notes.forEach(n => n.selected = false);
                this.note = this.project.notes.length ? this.project.notes[0] : null;
                if (this.note !== null) {
                    this.note.selected = true;
                }
            }
        );
        this.noteTitle = 'This is a note title';
    }

    updateTodos() {
        let update = {
            todos: this.project.todos
        };
        this.projectsAPI.updateProject(this.project.id, update).then(
            () => {
                this.mcStateStore.fire('sync:project');
            },
            () => this.toast.error('Unable to update project to-dos on server')
        );
    }

    addTodo() {
        let todo = {
            title: '',
            done: false,
            edit: true
        };

        this.project.todos.push(todo);
        this.updateTodos();
    }

    removeTodo(index) {
        this.project.todos.splice(index, 1);
        this.updateTodos();
    }

    toggleTodoEdit(todo) {
        if (todo.edit) {
            this.updateTodos();
        }

        todo.edit = !todo.edit;
    }

    addNote() {
        let note = {
            title: '',
            note: '',
            edit: true,
        };
        this.projectsAPI.addProjectNote(this.project.id, note).then(
            (n) => {
                this.project.notes.push(n);
                this.project.notes.forEach(n => n.selected = false);
                this.note = this.project.notes[this.project.notes.length - 1];
                this.note.selected = true;
                this.note.edit = true;
            },
            () => this.toast.error('Unable to add note to project on server')
        );
    }

    deleteNote(index) {
        this.projectsAPI.deleteProjectNote(this.project.id, this.project.notes[index]).then(
            () => {
                this.project.notes.splice(index, 1);
            },
            () => this.toast.error('Unable to delete note on server')
        );
    }

    toggleEditNote(note) {
        if (note.edit) {
            this.projectsAPI.updateProjectNote(this.project.id, note).then(
                () => {
                    let index = _.findIndex(this.project.notes, n => n.id == note.id);
                    this.project.notes[index].title = note.title;
                    this.project.notes[index].note = note.note;
                },
                () => this.toast.error('Unable to update note on server')
            );
        }

        note.edit = !note.edit;
    }

    selectNote(note) {
        this.project.notes.forEach(n => n.selected = false);
        note.selected = true;
        this.note = note;
    }
}

angular.module('materialscommons').component('mcProjectNotes', {
    template: require('./mc-project-notes.html'),
    controller: MCProjectNotesComponentController
});