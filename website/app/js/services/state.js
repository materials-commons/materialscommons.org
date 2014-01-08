var stateServices = angular.module('stateServices', ['ngResource']);

stateServices.
    factory('Stater', function (mcapi) {
        var S = {};
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
            //console.dir(state);
            S.state = state;
        }

        S.retrieve = function () {
            return S.state;
        }

        S.persist = function (state) {
            S.state = state;
            if ('id' in S.state) {
                mcapi('/stater/%', S.state.id).put({attributes: S.state.attributes});
            }
        }

        S.retrieveRemote = function (f) {
            mcapi('/stater')
                .success(function (data) {
                    S.state = data;
                    f(true, data);
                })
                .error(function () {
                    f(false);
                }).jsonp();
        }

        S.clear = function () {
            S.state = {};
        }

        S.clearAllRemote = function () {
            mcapi('/stater').delete();
        }

        S.clearRemote = function () {
            mcapi('/stater/%', S.state.id).delete();
        }

        return S;
    });

