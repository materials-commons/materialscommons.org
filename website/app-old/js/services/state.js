var stateServices = angular.module('stateServices', ['ngResource']);

stateServices.
    factory('Stater', function (mcapi) {
        var S = {
            all: []
        };
        S.newId = function (name, description, type, f) {
            mcapi('/stater')
                .success(function (data) {
                    S.state = data;
                    S.state.attributes = {};
                    f(true, S.state);
                })
                .error(function () {
                    f(false);
                }).post({name: name, description: description, type: type});
        }

        S.save = function (state) {
            S.state = state;
        }

        S.retrieve = function () {
            return S.state;
        }

        S.persist = function (state, f) {
            S.state = state;
            var callfunc = false;
            if (arguments.length == 2) {
               callfunc = true;
            }
            if ('id' in S.state) {
                mcapi('/stater/%', S.state.id)
                    .success(function() {
                        if (callfunc) {
                            f();
                        }
                    })
                    .put({
                        attributes: S.state.attributes,
                        name: S.state.name,
                        description: S.state.description
                    });
            }
        }

        S.retrieveRemote = function (state_id, f) {
            var callfunc = arguments.length == 2;
            mcapi('/stater/%', state_id)
                .success(function (data) {
                    S.state = data;
                    if (callfunc) {
                        f(true, data);
                    }
                })
                .error(function () {
                    if (callfunc) {
                        f(false);
                    }
                }).jsonp();
        }

        S.clear = function () {
            S.state = {};
        }

        S.clearAllRemote = function () {
            mcapi('/stater').delete();
        }

        S.clearRemote = function (stateId, f) {
            var callfunc = arguments.length == 2;
            mcapi('/stater/%', stateId)
                .success(function() {
                    if (callfunc) {
                        f();
                    }
                }).delete();
        }

        S.retrieveAll = function (username, f) {
            var callfunc = false;
            if (arguments.length == 2) {
                callfunc = true;
            }
            mcapi('/stater/user/%', username)
                .success(function (data) {
                    S.all = data;
                    if (callfunc) {
                        f(data);
                    }
                })
                .error(function () {
                    S.all = [];
                }).jsonp();
        }

        return S;
    });

stateServices.factory('Thumbnails', [function () {
    var service = {
        model: {
            datadir: '',
            datadirs: [],
            layout: 'grid',
            pics: []
        },

        clear: function () {
            service.model.datadirs = [];
            service.model.datadir = '';
            service.model.pics = [];
            service.model.layout = 'grid';
        }
    };
    return service;
}]);

stateServices.factory('Projects', [function () {
    var service = {
        model: {
            projects: {}
        },
        channel: null,

        clear: function () {
            service.model.projects = {};
        },

        setChannel: function(what) {
            service.channel = what;
        }
    };
    return service;
}]);

stateServices.factory('ProvDrafts', [function () {
    var service = {
        current: null,
        drafts: [],

        newDraft: function() {
            var draft = {
                attributes: {
                    process: {},
                    input_conditions: [],
                    output_conditions: [],
                    input_files: [],
                    output_files: []
                },

                project_id: "",
                id: "",
                owner: "",
                description: "",
                name: ""
            };

            return draft;
        },

        addDraft: function(draft) {
            service.drafts.push(draft);
        },

        removeCurrent: function() {
            var id = service.current.id;
            for (var i = 0; i < service.drafts.length; i++) {
                if (service.drafts[i].id == id) {
                    service.drafts.splice(i, 1);
                    break;
                }
            }
        }
    };

    return service;
}]);
