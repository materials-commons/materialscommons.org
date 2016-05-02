class NotesService {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    createNote(projectID, experimentID, note) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('notes').customPOST(note);
    }

    updateNote(projectID, experimentID, noteID, noteArgs) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('notes', noteID).customPUT(noteArgs);
    }
}

angular.module('materialscommons').service('notesService', NotesService);
