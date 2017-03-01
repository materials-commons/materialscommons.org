class NotesAPIService {
    /*@ngInject*/
    constructor(projectsAPIRoute) {
        this.projectsAPIRoute = projectsAPIRoute;
    }

    createNote(projectID, experimentID, note) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('notes').customPOST(note);
    }

    updateNote(projectID, experimentID, noteID, noteArgs) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('notes', noteID).customPUT(noteArgs);
    }
}

angular.module('materialscommons').service('notesAPI', NotesAPIService);
