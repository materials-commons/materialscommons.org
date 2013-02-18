'use strict';

/* Services */

angular.module('materialsCommonsServices', []).
    factory('User', function() {

        function MCUser() {
            this.authenticated = false;
        }

        User.prototype.isAuthenticated = function() {
            return this.authenticated;
        }

        return function() {
            return new MCUser();
        };
    });
