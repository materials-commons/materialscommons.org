class NotesAPIService {
    /*@ngInject*/
    constructor(projectsAPIRoute) {
        this.projectsAPIRoute = projectsAPIRoute;
    }

    createNote(projectID, experimentID, note) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('notes')
            .customPOST(note).then(n => n.plain());
    }

    updateNote(projectID, experimentID, noteID, noteArgs) {
        return this.projectsAPIRoute(projectID).one('experiments', experimentID).one('notes', noteID)
            .customPUT(noteArgs).then(n => n.plain());
    }
}

angular.module('materialscommons').service('notesAPI', NotesAPIService);
