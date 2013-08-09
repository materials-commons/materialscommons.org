'use strict';

/* Services */

var materialsCommonsServices =  angular.module('materialsCommonsServices', ['ngResource', 'CornerCouch']);

materialsCommonsServices.
    factory('User', function() {
        var self = this;
        self.authenticated = false;
        self.email_address = 'Login';
        return {
            isAuthenticated: function() {
                return self.authenticated;
            },

            setAuthenticated: function(value, email_address) {
                self.authenticated = value;
                self.email_address = email_address;

            },

            get_username: function(){
                return self.email_address;
            },

            u: function() { return self.email_address; }
        };
    });

materialsCommonsServices.factory('Mcdb', function(cornercouch) {
    var self = this;
    self.server = cornercouch();
    self.server.session();
    self.mcdb = self.server.getDB("materialscommons");

    return {
        db: function() {
            return self.mcdb;
        },

        query: function(view, params) {
            self.mcdb.query("materialscommons-app", view, params);
        }
    }

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

materialsCommonsServices.
    factory('uploadService', ['$rootScope', function ($rootScope) {

    return {
        send: function (file) {
            var data = new FormData(),
                xhr = new XMLHttpRequest();

            // When the request starts.
            xhr.onloadstart = function () {
                console.log('Factory: upload started: ', file.name);
                $rootScope.$emit('upload:loadstart', xhr);
            };

            // When the request has failed.
            xhr.onerror = function (e) {
                $rootScope.$emit('upload:error', e);
            };

            // Send to server, where we can then access it with $_FILES['file].
            data.append('file', file, file.name);
            xhr.open('POST', '/echo/json');
            xhr.send(data);
        }
    };

}]);

materialsCommonsServices.
    factory('uploadManager', ['$rootScope', function($rootScope){
    var _files = [];
    return {
        add: function (file) {
            _files.push(file);
            $rootScope.$broadcast('fileAdded', file.files[0].name);
        },
        clear: function () {
            _files = [];
        },
        files: function () {
            var fileNames = [];
            $.each(_files, function (index, file) {
                fileNames.push(file.files[0].name);
            });
            return fileNames;
        },
        upload: function () {
            $.each(_files, function (index, file) {
                file.submit();
            });
            this.clear();
        },
        setProgress: function (percentage) {
            $rootScope.$broadcast('uploadProgress', percentage);
        }
    };
}]);

