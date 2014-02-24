Application.Provenance.Services.factory('ProvDrafts', ["mcapi", "pubsub",
    function (mcapi, pubsub) {
        var service = {
            current: null,
            drafts: [],
            channel: 'drafts.update',

            newDraft: function () {
                var draft = {
                    id: "",
                    project_id: "",
                    owner: "",
                    description: "",
                    name: "",
                    birthtime: "",
                    attributes: {
                        process: {},
                        input_conditions: {},
                        output_conditions: {},
                        input_files: [],
                        output_files: [],
                        machine: {},
                        project_id: ""
                    }
                };

                return draft;
            },

            findDraft: function (id) {
                var i;
                for (i = 0; i < service.drafts.length; i++) {
                    if (service.drafts[i].id === id) {
                        return service.drafts[i];
                    }
                }
                return null;
            },

            _publishChange: function () {
                pubsub.send(service.channel, '');
            },

            saveDraft: function () {
                if (service.current.id === "") {
                    // We haven't saved this draft before
                    mcapi('/drafts')
                        .success(function (draft) {
                            service.current.id = draft.id;
                            service.current.birthtime = draft.birthtime;
                            service.drafts.push(service.current);
                            service._publishChange();
                        }).post({
                            name: service.current.name,
                            description: service.current.description,
                            project_id: service.current.project_id,
                            attributes: service.current.attributes
                        });
                } else {
                    // Need to update the draft
                    mcapi('/drafts/%', service.current.id).put({
                        name: service.current.name,
                        description: service.current.description,
                        project_id: service.current.project_id,
                        attributes: service.current.attributes
                    });
                }
            },

            loadRemoteDrafts: function (f) {
                var callfunc = arguments.length === 1;
                mcapi('/drafts')
                    .success(function (drafts) {
                        drafts.forEach(function (draft) {
                            service.drafts = [];
                            service.drafts.push(draft);
                        });
                        service._publishChange();
                    }).jsonp();
            },

            deleteRemoteDraft: function (draft_id) {
                mcapi('/drafts/%', draft_id)
                    .success(function () {
                        var i = _.indexOf(service.drafts, function (item) {
                            if (item.id === draft_id) {
                                return true;
                            }
                            return false;
                        });
                        if (i !== -1) {
                            service.drafts.splice(i, 1);
                            service._publishChange();
                        }
                    }).delete();
            }
        };

        return service;
    }]);
