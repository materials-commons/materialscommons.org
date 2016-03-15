export function mcapiService($http, User, mcglobals, $log) {
    'ngInject';

    function MCApi() {
        this.url = this._makeUrl.apply(this, arguments);
        this.on_error = undefined;
        this.on_success = undefined;
    }

    MCApi.prototype._makeUrl = function() {
        var apihost = mcglobals.apihost ? mcglobals.apihost : "https://api.materialscommons.org";

        if (arguments.length < 1) {
            throw "Invalid url spec";
        }

        var s = arguments[0];

        for (var i = 1; i < arguments.length; i++) {
            s = s.replace('%', arguments[i]);
        }

        var url = apihost + s + "?apikey=" + User.apikey();
        return url;
    };

    MCApi.prototype.success = function(on_success) {
        this.on_success = on_success;
        return this;
    };

    MCApi.prototype.error = function(on_error) {
        this.on_error = on_error;
        return this;
    };

    MCApi.prototype.arg = function(a) {
        /*
         ** There is always a ?apikey=xxx on the url so all additional args
         ** are &'d onto the url
         */
        this.url = this.url + "&" + a;
        return this;
    };

    MCApi.prototype.argWithValue = function(a, v) {
        this.url = this.url + "&" + a + "=" + v;
        return this;
    };

    MCApi.prototype.put = function(putData, putConfig) {
        var self = this;
        $http.put(this.url, putData, putConfig)
            .success(function(data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function(data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            });
    };

    MCApi.prototype.delete = function(deleteConfig) {
        var self = this;
        $http.delete(this.url, deleteConfig)
            .success(function(data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function(data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            });
    };

    MCApi.prototype.post = function(postData, postConfig) {
        var self = this;
        $http.post(this.url, postData, postConfig)
            .success(function(data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function(data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            });
    };

    MCApi.prototype.get = function(getConfig) {
        var self = this;
        $http.get(this.url, getConfig)
            .success(function(data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function(data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            });
    };

    MCApi.prototype.getJson = function() {
        var self = this;
        $http.get(this.url, {
                cache: false,
                transformResponse: function(data) {
                    try {
                        var jsonObject = angular.fromJson(data);
                        return jsonObject;
                    } catch (e) {
                        $log.log("Invalid json: " + e);
                    }
                    return {};
                }
            })
            .success(function(data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function(data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            });
    };

    MCApi.prototype.jsonp = function(jsonpConfig) {
        var self = this;
        var jsonpurl = _add_json_callback(this.url);
        $http.jsonp(jsonpurl, jsonpConfig)
            .success(function(data) {
                if (data.success) {
                    if (self.on_success) {
                        self.on_success.call(self, data.data, data.status_code);
                    }
                } else {
                    if (self.on_error) {
                        self.on_error.call(self, data.data, data.status_code);
                    }
                }
            });
    };

    return function() {
        function F2(args) {
            return MCApi.apply(this, args);
        }

        F2.prototype = MCApi.prototype;
        return new F2(arguments);
    };

}
