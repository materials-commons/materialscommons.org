class NotesAPIService {
    /*@ngInject*/
    constructor(Restangular) {
        this.notesAPIRoute = _.partial(Restangular.one('v2').one, 'notes');
    }

    addNote(note, itemType, itemId) {
        return this.notesAPIRoute().customPOST({
            item_type: itemType,
            item_id: itemId,
            title: note.title,
            note: note.note
        }).then(n => n.plain());
    }

    updateNote(note, itemType, itemId) {
        return this.notesAPIRoute(note.id).customPUT({
            item_type: itemType,
            item_id: itemId,
            title: note.title,
            note: note.note
        }).then(n => n.plain());
    }

    deleteNote(note, itemType, itemId) {
        return this.notesAPIRoute(note.id).one('delete').customPOST({
            item_type: itemType,
            item_id: itemId,
        });
    }
}

angular.module('materialscommons').service('notesAPI', NotesAPIService);
