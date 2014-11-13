Application.Services.factory("Project", ['$filter', Project]);

function Project($filter) {
    var service = {

        getNotes: function (project, item_type, item_id) {
            var notes = project.notes;
            var notes_by_item_type = $filter('byKey')(notes, 'item_type', item_type);
            return notes_by_item_type;
        }
    };

    return service;
}
