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
                    project_name: "",
                    owner: "",
                    description: "",
                    name: "",
                    birthtime: "",
                    process: {}
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
                            project_name: service.current.project_name,
                            process: service.current.process,
                            clone_number: service.current.clone_number
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
                            project_name: service.current.project_name,
                            process: service.current.process,
                            clone_number: service.current.clone_number
                        });
                }
            },

            loadRemoteDrafts: function () {
                console.log('yes')
                mcapi('/drafts')
                    .success(function (drafts) {
                        console.log(drafts)
                        service.drafts = [];
                        drafts.forEach(function (draft) {
                            service.drafts.push(draft);
                        });
                        service._publishChange();
                    }).jsonp();
            },

            prepareClone: function (df, clone_num) {
                var i;
                var clone_numbers = service.get_existing_clones(), new_draft = {}, count = 0, pattern = '', split_name = [], count_list = [], largest = 0;
                if (clone_num === '') {
                    pattern = df.process.name;
                } else {
                    split_name = df.clone_number.split('---');
                    pattern = split_name[0];
                }

                for (i = 0; i < clone_numbers.length; i++) {
                    if (clone_numbers[i].indexOf(pattern) > -1) {
                        split_name = clone_numbers[i].split('---');
                        if (split_name !== [""]) {
                            count_list.push(parseInt(split_name[1]));
                        }
                    }
                }
                if (count_list.length !== 0) {
                    largest = Math.max.apply(Math, count_list);
                    count = largest + 1;
                } else {
                    count = largest + 1;
                }
                new_draft = df;
                new_draft.id = '';
                new_draft.clone_number = pattern + '---' + count;
                new_draft.process.name = new_draft.clone_number;
                new_draft.process.input_files = [];
                new_draft.process.output_files = [];
                return new_draft;
            },

            get_existing_clones: function () {
                var clones = [];
                service.drafts.forEach(function (item) {
                    if (item.clone_number) {
                        clones.push(item.clone_number);
                    }

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
