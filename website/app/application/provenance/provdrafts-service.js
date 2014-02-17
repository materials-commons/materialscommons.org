Application.Provenance.Services.factory('ProvDrafts', [function () {
    var service = {
        current: null,
        drafts: [],

        newDraft: function () {
            var draft = {
                attributes: {
                    process: {},
                    input_conditions: [],
                    output_conditions: [],
                    input_files: [],
                    output_files: [],
                    machine: {},
                    project_id: ""
                },


                id: "",
                owner: "",
                description: "",
                name: "",
                birthtime: ""
            };

            return draft;
        },

        addDraft: function (draft) {
            service.drafts.push(draft);
        },

        removeCurrent: function () {
            var id = service.current.id,
                i;
            for (i = 0; i < service.drafts.length; i++) {
                if (service.drafts[i].id === id) {
                    service.drafts.splice(i, 1);
                    break;
                }
            }
        },

        findDraft: function (id) {
            var i;
            for (i = 0; i < service.drafts.length; i++) {
                if (service.drafts[i].id === id) {
                    return service.drafts[i];
                }
            }
            return null;
        }
    };

    return service;
}]);
