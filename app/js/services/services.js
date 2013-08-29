'use strict';

/* Services */

var materialsCommonsServices =  angular.module('materialsCommonsServices', ['ngResource']);

materialsCommonsServices.
    factory('User', function() {
        console.log("User created");
        var self = this;
        self.authenticated = false;
        self.email_address = 'Login';
        self.apikey = undefined;
        return {
            isAuthenticated: function() {
                return self.authenticated;
            },

            setAuthenticated: function(value, apikey, email_address) {
               // console.log('passed apikey as argument is '+ apikey);
                self.authenticated = value;
                self.email_address = email_address;
                self.apikey = apikey;
            },

            apikey: function() {
                return self.apikey;
            },

            u: function() { return self.email_address; },

            reset_apikey: function(new_key){
                self.apikey = new_key;
                //console.log("after reset api key is :" + self.apikey);

            }
        };
    });

materialsCommonsServices.factory('Mcdb', function() {

});


materialsCommonsServices.
    factory('Search', function($resource) {
    var data;
    var host_name = document.location.hostname;
    var resource_obj=  $resource('http://'+host_name+'\\:9200/mcindex/materialscommons/_search',{});

    return {
        get_all_info: function(keyword, fun) {
            //return resource_obj.get(fun)
            return resource_obj.get({q:keyword}, fun);
            //return resource_obj.get({q:keyword, "from" : 0, "size" : 8} , fun);
        },

        get_set_of_results_for_pagination: function(keyword, from, size, fun) {
            return resource_obj.get({q:keyword, "from" : from, "size" : size} , fun);
        }
    };
});

materialsCommonsServices.factory('formDataObject', function () {
    return function (data) {
        var fd = new FormData();
        angular.forEach(data, function (value, key) {
            fd.append(key, value);
        });
        return fd;
    };
});
