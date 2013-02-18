'use strict';

/* Services */

angular.module('materialsCommonsServices', []).
    factory('User', function() {
        var self = this;
        self.authenticated = false;
        return {
            isAuthenticated: function() {
                return self.authenticated;
            }

        };
    });
