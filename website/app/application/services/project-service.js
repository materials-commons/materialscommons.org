Application.Services.factory("Project", ['$filter', Project]);

function Project($filter) {
    var service = {

        getNotes: function (project, item_type) {
            var notes = project.notes;
            if (item_type) {
                var notes_by_item_type = $filter('byKey')(notes, 'item_type', item_type);
                return notes_by_item_type;
            } else {
                return notes;
            }
        },
        getSpecificNotes: function (project, item_id, item_type) {
            var notes = project.notes;
            if (item_type && item_id) {
                var notes_by_item_type = $filter('byKey')(notes, 'item_type', item_type);
                var notes_by_item_id = $filter('byKey')(notes_by_item_type, 'item_id', item_id);
                return notes_by_item_id;
            } else {
                return notes;
            }
        }
    };

    return service;
}
