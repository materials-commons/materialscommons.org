Application.Directives.directive('createNote', createNoteDirective);
function createNoteDirective() {
    return {
        restrict: "EA",
        controller: 'createNoteDirectiveController',
        controllerAs: 'note',
        scope: {
            item: '=item',
            itemType: '@'
        },
        bindToController: true,
        templateUrl: 'application/directives/create-note.html'
    };
}

Application.Controllers.controller('createNoteDirectiveController',
    ["User", "mcapi", "current", "pubsub", createNoteDirectiveController]);

function createNoteDirectiveController(User, mcapi, current, pubsub) {
    var ctrl = this;
    ctrl.model = {
        title: '',
        note: ''
    };

    ctrl.project = current.project();

    ctrl.cancel = function () {
        switch (ctrl.itemType) {
            case "datafile":
                 pubsub.send('datafile-note.change');
                break;
            case "project":
                break;
            case "sample":
                break;
        }
    };

    ctrl.save = function () {
        var note = {
            owner: User.u(),
            project_id: ctrl.project.id,
            note: ctrl.model.note,
            title: ctrl.model.title
        };
        switch (ctrl.itemType) {
            case "datafile":
                mcapi('/datafile/%/note', ctrl.item.df_id)
                    .success(function (note) {
                        ctrl.item.notes = [note];
                        pubsub.send('datafile-note.change');
                    }).put(note);
                break;
            case "project":
                break;
            case "sample":
                break;
        }
    };

    function init() {
        if (ctrl.itemType == 'datafile' && ctrl.item.notes.length) {
            ctrl.model.title = ctrl.item.notes[0].title;
            ctrl.model.note = ctrl.item.notes[0].note;
        }
    }

    init();
}
