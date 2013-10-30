
var stateServices = angular.module('stateServices', ['ngResource']);

stateServices.
    factory('State', function(mcapi, $cookieStore, User) {
        var self = this;

        return {
            newId: function(f) {
                mcapi('/state/new')
                    .success(function(data) {
                        f(true, data.id);
                    })
                    .error(function() {
                        f(false);
                    }).jsonp();
            },

            existingState: function() {
                var userStateCookie = self._userStateCookie();
                return $cookieStore.get(userStateCookie);
            },

            store: function(id, what) {
                var cookieVal = $cookieStore.get(self._userStateCookie());
                if (cookieVal) {
                    cookieVal[id] = what;
                    $cookieStore.put(self._userStateCookie(), cookieVal);
                } else {
                    var cookie = [];
                    cookie[id] = what;
                    $cookieStore.put(self._userStateCookie(), cookie);
                }
            },

            retrieve: function(id) {
                var cookieVal = $cookieStore.get(self._userStateCookie());
                if (cookieVal) {
                    if (id in cookieVal) {
                        return cookieVal[id];
                    }
                }

                return undefined;
            },

            clear: function() {
                $cookieStore.remove(self._userStateCookie());
            },

            _persist: function(id) {

            },

            _retrieveRemote: function(id) {

            },

            _userStateCookie: function() {
                return 'mcuser_state_' + User.u();
            }
        }
    });