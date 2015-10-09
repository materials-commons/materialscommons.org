(function (module) {
    module.directive('fileNotes', fileNotesDirective);
    function fileNotesDirective() {
        return {
            restrict: "E",
            scope: {
                file: "="
            },
            controller: 'FileNotesDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/core/projects/project/files/file-notes.html'
        };
    }

    module.controller('FileNotesDirectiveController', FileNotesDirectiveController);
    FileNotesDirectiveController.$inject = ['toastr'];

    function FileNotesDirectiveController(toastr) {
        var ctrl = this;

        ctrl.addNoteActive = false;
        ctrl.updateNote = updateNote;
        ctrl.saveNewNote = saveNewNote;
        ctrl.cancelNote = cancelNote;
        ctrl.newNote = {
            note: '',
            title: ''
        };

        //////////////////////////
        function updateNote(note) {
            var notes = [];
            notes.push(note);
            ctrl.file.customPUT({notes: notes}).then(function(f) {
                ctrl.file.notes = f.notes;
                note.edit = false;
            }).catch(function(err) {
                toastr.error("Failed updating note: " + err.error, "Error");
            });
        }

        function saveNewNote(note) {
            var notes = [];
            notes.push({note: note.note, title: note.title});
            ctrl.file.customPUT({notes: notes}).then(function(f) {
                ctrl.file.notes = f.notes;
                ctrl.addNoteActive = false;
                ctrl.newNote.note = '';
                ctrl.newNote.title = '';
            }).catch(function(err) {
                toastr.error("Failed adding note: " + err.error, "Error");
            });
        }

        function cancelNote(note) {
            ctrl.addNoteActive = false;
            note.edit = false;
        }
    }
}(angular.module('materialscommons')));

