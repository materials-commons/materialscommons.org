class NotesService {
    /*@ngInject*/
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    createNote(projectID, experimentID, note) {
        return this.projectsAPI(projectID).one('experiments', experimentID).one('notes').customPOST(note);
    }
}

angular.module('materialscommons').service('notesService', NotesService);
