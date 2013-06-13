'use strict';

/* Services */

var materialsCommonsServices =  angular.module('materialsCommonsServices', ['ngResource']);

materialsCommonsServices.
    factory('User', function() {
        var self = this;
        self.authenticated = false;
        return {
            isAuthenticated: function() {
                return self.authenticated;
            },

            setAuthenticated: function(value) {
                self.authenticated = value;
            }
        };
    });


materialsCommonsServices.factory('Search', function($resource) {
    var data;
    var resource_obj=  $resource('http://localhost\\:9200/mcindex/materialscommons/_search',{});

    return {
        get_all_phones: function(keyword, fun) {
            //return resource_obj.get(fun)
            return resource_obj.get({q:keyword}, fun);
            //return resource_obj.get({q:keyword, "from" : 0, "size" : 8} , fun);
        },

        get_set_of_results_for_pagination: function(keyword, from, size, fun) {
            return resource_obj.get({q:keyword, "from" : from, "size" : size} , fun);
        }


    };
});