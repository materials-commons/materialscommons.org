'use strict';

/* Services */

var materialsCommonsServices = angular.module('materialsCommonsServices', ['ngResource']);

materialsCommonsServices.
    factory('User', function () {
        var self = this;
        self.authenticated = false;
        self.email_address = 'Login';
        self.apikey = undefined;
        return {
            isAuthenticated: function () {
                return self.authenticated;
            },

            setAuthenticated: function (value, apikey, email_address) {
                // console.log('passed apikey as argument is '+ apikey);
                //console.log('passed apikey as argument is '+ apikey);
                self.authenticated = value;
                self.email_address = email_address;
                self.apikey = apikey;
            },

            apikey: function () {
                return self.apikey;
            },

            u: function () {
                return self.email_address;
            },

            reset_apikey: function (new_key) {
                self.apikey = new_key;
                //console.log("after reset api key is :" + self.apikey);

            }
        };
    });

materialsCommonsServices.
    factory('Search', function ($resource) {
        var data;
        var host_name = document.location.hostname;
        var resource_obj = $resource('http://' + host_name + '\\:9200/mcindex/materialscommons/_search', {});

        return {
            get_all_info: function (keyword, fun) {
                //return resource_obj.get(fun)
                return resource_obj.get({q: keyword}, fun);
                //return resource_obj.get({q:keyword, "from" : 0, "size" : 8} , fun);
            },

            get_set_of_results_for_pagination: function (keyword, from, size, fun) {
                return resource_obj.get({q: keyword, "from": from, "size": size}, fun);
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

materialsCommonsServices.factory('alertService', function ($rootScope) {
    var sharedService = {};
    sharedService.message = '';

    sharedService.prepForBroadcast = function (msg) {
        this.message = msg;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function () {
        $rootScope.$broadcast('handleBroadcast')
    };

    return sharedService;
});


materialsCommonsServices.factory('mcapi', function ($http, User) {
    function MCApi() {
        this.url = this._makeUrl.apply(this, arguments);
        this.on_error = undefined;
        this.on_success = undefined;
    }

    MCApi.prototype._makeUrl = function () {
        var apihost = mcglobals.apihost ? mcglobals.apihost : "https://api.materialscommons.org:5000/v1.0";

        if (arguments.length < 1) {
            throw "Invalid mcurl spec";
        }

        var s = arguments[0];

        for (var i = 1; i < arguments.length; i++) {
            s = s.replace('%', arguments[i]);
        }

        var url = apihost + s + "?apikey=" + User.apikey();
        return url;
    }

    MCApi.prototype.success = function (on_success) {
        this.on_success = on_success;
        return this;
    }

    MCApi.prototype.error = function (on_error) {
        this.on_error = on_error;
        return this;
    }

    MCApi.prototype.put = function (putData, putConfig) {
        var self = this;
        $http.put(this.url, putData, putConfig)
            .success(function (data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function (data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            })
    }

    MCApi.prototype.delete = function (deleteConfig) {
        var self = this;
        $http.delete(this.url, deleteConfig)
            .success(function (data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function (data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            })
    }

    MCApi.prototype.post = function (postData, postConfig) {
        var self = this;
        $http.post(this.url, postData, postConfig)
            .success(function (data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function (data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            })
    }

    MCApi.prototype.get = function (getConfig) {
        var self = this;
        $http.get(this.url, getConfig)
            .success(function (data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function (data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            })
    }

    MCApi.prototype.jsonp = function (jsonpConfig) {
        var self = this;
        var jsonpurl = _add_json_callback(this.url);
        $http.jsonp(jsonpurl, jsonpConfig)
            .success(function (data) {
                if (data.success) {
                    if (self.on_success) {
                        self.on_success.call(self, data.data, data.status_code);
                    }
                } else {
                    if (self.on_error) {
                        self.on_error.call(self, data.data, data.status_code);
                    }
                }
            })
    }

    return function () {
        function F2(args) {
            return MCApi.apply(this, args);
        }

        F2.prototype = MCApi.prototype;
        return new F2(arguments);
    }

});

materialsCommonsServices.factory('decodeAlerts', function () {
    var alert_msg = {
        'forbidden': 'Access Denied',
        'bad request': 'Error:  Please try again'
    };
    return {
        get_alert_msg: function (key) {
            return alert_msg[key];
        }

    }
});