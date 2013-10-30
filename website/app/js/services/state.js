var stateServices = angular.module('stateServices', ['ngResource']);

stateServices.
    factory('Stater', function (mcapi, $cookieStore, User) {
        var S = {};

        S.newId = function (name, description, f) {
            mcapi('/stater')
                .success(function (data) {
                    var cookie = S._createCookie();
                    cookie.id = data.id;
                    $cookieStore.put(S._userStateCookie(), cookie);
                    f(true, cookie);
                })
                .error(function () {
                    f(false);
                }).post({name: name, description: description});
        };

        S.existingState = function () {
            var userStateCookie = S._userStateCookie();
            return $cookieStore.get(userStateCookie);
        };

        S.store = function (what) {
            $cookieStore.put(S._userStateCookie(), what);
        };

        S.retrieve = function () {
            return $cookieStore.get(S._userStateCookie());
        };

        S.clear = function () {
            console.log("Calling clear: " + S._userStateCookie());
            $cookieStore.remove(S._userStateCookie());
        };

        S.persist = function () {
            var cookieVal = $cookieStore.get(S._userStateCookie());
            if (cookieVal) {
                mcapi('/stater/%', cookieVal.id)
                    .success(function () {
                    })
                    .error(function () {
                    }).put({attributes: cookieVal.attributes});
            }
        };

        S.retrieveRemote = function (id) {

        };

        S._userStateCookie = function () {
            return 'mcuser_state_' + User.u();
        };

        S._createCookie = function () {
            var cookie = $cookieStore.get(S._userStateCookie());
            if (cookie) {
                return cookie;
            } else {
                cookie = {};
                $cookieStore.put(S._userStateCookie(), cookie);
                return cookie;
            }
        };
        return S;
    });