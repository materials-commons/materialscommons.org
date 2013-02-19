'use strict';

/* Services */

angular.module('materialsCommonsServices', []).
    factory('User', function() {
        var self = this;
        self.authenticated = false;
        console.log("Creating User");
        return {
            isAuthenticated: function() {
                return self.authenticated;
            },

            setAuthenticated: function(value) {
                self.authenticated = value;
            },

            authenticate: function(password) {
                if (password == "abc123") {
                    self.authenticated = true;
                }

                return self.authenticated;
            }
        };
    });
