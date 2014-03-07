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

            saveDraft: function (f) {
                var callfunc = arguments.length === 1;
                if (service.current.id === "") {
                    // We haven't saved this draft before
                    mcapi('/drafts')
                        .success(function (draft) {
                            service.current.id = draft.id;
                            service.current.birthtime = draft.birthtime;
                            service.drafts.push(service.current);
                            service._publishChange();
                            if (callfunc) {
                                f();
                            }
                        }).post({
                            name: service.current.name,
                            description: service.current.description,
                            project_id: service.current.project_id,
                            attributes: service.current.attributes
                        });
                } else {
                    // Need to update the draft
                    mcapi('/drafts/%', service.current.id)
                        .success(function () {
                            if (callfunc) {
                                f();
                            }
                        }).put({
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
                        service.drafts = [];
                        drafts.forEach(function (draft) {
                            service.drafts.push(draft);
                        });
                        service._publishChange();
                    }).jsonp();
            },

            prepareClone: function (df, clone_num) {
                var new_draft = {}, clones_numbers = [];
                if (clone_num === '') {
                    console.log('first one ');
                    new_draft = df;
                    new_draft.id = '';
                    new_draft.clone_number = df.attributes.process.name + '-' + 1;
                    new_draft.attributes.process.name = new_draft.clone_number;
                    console.log(new_draft.attributes.input_conditions)
                    if (new_draft.attributes.input_conditions) {
                        for(var i = 0; i< new_draft.attributes.input_conditions.length; i++){
                            console.log(new_draft.attributes.input_conditions[i]);
                        }
//                        new_draft.attributes.input_conditions.forEach(function (cond) {
//                            new_draft.attributes.input_conditions[cond].default[0].value = df.attributes.input_conditions[cond].default[0].value + '-' + 1;
//                        });
                    }
                    if (new_draft.attributes.output_conditions) {
//                        new_draft.attributes.output_conditions.forEach(function (cond) {
//                            new_draft.attributes.output_conditions[cond].default[0].value = df.attributes.output_conditions[cond].default[0].value + '-' + 1;
//                        });
                    }
                    new_draft.attributes.input_files = [];
                    new_draft.attributes.output_files = [];
                    return new_draft;

                } else {
                    console.log('second one');
                    clones_numbers = ProvDrafts.get_existing_clones();
                    var make_name = '', i = 0, split_item = [];
                    while (i < 5) {
                        split_item = df.clone_number;
                        make_name = split_item[0] + (split_item[1] + 1);
                        if (clones_numbers.indexOf(make_name) === -1) {
                            new_draft = df;
                            new_draft.id = '';
                            new_draft.clone_number = make_name;
                            new_draft.attributes.process.name = new_draft.clone_number;
                            if (new_draft.attributes.input_conditions) {
                                new_draft.attributes.input_conditions.forEach(function (cond) {
                                    new_draft.attributes.input_conditions[cond].default[0].value = df.attributes.input_conditions[cond].default[0].value + '-' + (split_item[1] + 1);
                                });
                            }
                            if (new_draft.attributes.output_conditions) {
                                new_draft.attributes.output_conditions.forEach(function (cond) {
                                    new_draft.attributes.output_conditions[cond].default[0].value = df.attributes.output_conditions[cond].default[0].value + '-' + (split_item[1] + 1);
                                });
                            }
                            new_draft.attributes.input_files = [];
                            new_draft.attributes.output_files = [];
                            return new_draft;
                        }
                    };

                }
            },

            get_existing_clones: function () {
                var clones = [];
                service.drafts.forEach(function (item) {
                    clones.push(item.clone_number);
                });
                return clones;
            },

            deleteDraft: function (draft_id) {
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
            },

            clear: function () {
                service.drafts = [];
                service.current = null;
            }
        };

        return service;
    }]);
