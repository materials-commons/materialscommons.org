

Application.Services.factory('materials', ["$http",
    function ($http) {
        function MaterialsApi() {
            this.url = this._makeUrl.apply(this, arguments);
            this.on_error = undefined;
            this.on_success = undefined;
        }

        MaterialsApi.prototype._makeUrl = function () {
            var apihost = 'http://' + window.location.hostname + ':' + window.location.port;

            if (arguments.length < 1) {
                throw "Invalid url spec";
            }

            var s = arguments[0];

            for (var i = 1; i < arguments.length; i++) {
                s = s.replace('%', arguments[i]);
            }

            var url = apihost + s;
            return url;
        }

        MaterialsApi.prototype.success = function (on_success) {
            this.on_success = on_success;
            return this;
        }

        MaterialsApi.prototype.error = function (on_error) {
            this.on_error = on_error;
            return this;
        }

        MaterialsApi.prototype.arg = function (a) {
            /*
             ** There is always a ?apikey=xxx on the url so all additional args
             ** are &'d onto the url
             */
            this.url = this.url + "&" + a;
            return this;
        }

        MaterialsApi.prototype.argWithValue = function (a, v) {
            this.url = this.url + "&" + a + "=" + v;
            return this;
        }

        MaterialsApi.prototype.put = function (putData, putConfig) {
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

        MaterialsApi.prototype.delete = function (deleteConfig) {
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

        MaterialsApi.prototype.post = function (postData, postConfig) {
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

        MaterialsApi.prototype.get = function (getConfig) {
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

        MaterialsApi.prototype.getJson = function () {
            var self = this;
            $http.get(this.url, {
                cache: false,
                transformResponse: function (data) {
                    try {
                        var jsonObject = JSON.parse(data);
                        return jsonObject;
                    } catch (e) {
                        console.log("Invalid json: " + e);
                    }
                    return {}
                }
            })
                .success(function (data, status, headers, config) {
                    if (self.on_success) {
                        self.on_success(data, status, headers, config);
                    }
                })
                .error(function (data, status, headers, config) {
                    if (self.on_error) {
                        self.on_error(data, status, headers, config);
                    }
                });
        }

        MaterialsApi.prototype.jsonp = function (jsonpConfig) {
            var self = this;
            var jsonpurl = _add_json_callback2(this.url);
            $http.jsonp(jsonpurl, jsonpConfig)
                .success(function (data) {
                    if (self.on_success) {
                        self.on_success.call(self, data);
                    }
                })
        }

        return function () {
            function F2(args) {
                return MaterialsApi.apply(this, args);
            }

            F2.prototype = MaterialsApi.prototype;
            return new F2(arguments);
        }
    }]);

function _add_json_callback(url) {
    var qIndex = url.indexOf("?");
    var argSeparator = "&";
    if (qIndex == -1) {
        argSeparator = "?";
    }

    return url + argSeparator + "callback=JSON_CALLBACK";
}
