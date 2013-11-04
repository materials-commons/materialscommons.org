'use strict';

/* Services */

var materialsCommonsServices = angular.module('materialsCommonsServices', ['ngResource']);

materialsCommonsServices.
    factory('User', function ($cookieStore) {
        var self = this;
        self.mcuser = $cookieStore.get('mcuser');

        return {
            isAuthenticated: function () {
                return self.mcuser;
            },

            setAuthenticated: function (authenticated, apikey, email) {
                if (!authenticated) {
                    $cookieStore.remove('mcuser');
                    self.mcuser = undefined;
                } else {
                    var mcuser = {};
                    mcuser.apikey = apikey;
                    mcuser.email = email;
                    $cookieStore.put('mcuser', mcuser);
                    self.mcuser = mcuser;
                }
            },

            apikey: function () {
                return self.mcuser ? self.mcuser.apikey : undefined;
            },

            u: function () {
                return self.mcuser ? self.mcuser.email : 'Login';
            },

            reset_apikey: function (new_key) {
                if (self.mcuser) {
                    self.mcuser.apikey = new_key;
                    $cookieStore.put('mcuser', self.mcuser);
                }
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

materialsCommonsServices.factory('toUploadForm', function () {
    return function (data) {
        var fd = new FormData();
        angular.forEach(data, function (value, key) {
            if (key != "files") {
                fd.append(key, value);
            } else {
                for (var i = 0; i < data.files.length; i++) {
                    fd.append("file_" + i, data.files[i].file);
                    fd.append("file_" + i + "_datadir", data.files[i].datadir);
                }
            }
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

materialsCommonsServices.factory('pubsub', function ($rootScope) {
    var pubsubService = {};
    pubsubService.message = '';

    pubsubService.send = function (channel, msg) {
        this.message = msg;
        $rootScope.$broadcast(channel);
    }

    pubsubService.waitOn = function (scope, channel, fn) {
        scope.$on(channel, function () {
            fn(pubsubService.message);
        });
    }

    return pubsubService;
});

materialsCommonsServices.factory('watcher', function () {
    var watcherService = {};

    watcherService.watch = function (scope, variable, fn) {
        scope.$watch(variable, function (newval, oldval) {
            if (!newval && !oldval) {
                return;
            }
            else if (newval == "" && oldval) {
                fn(oldval);
            } else {
                fn(newval);
            }
        });
    }

    return watcherService;
});


materialsCommonsServices.factory('mcapi', function ($http, User) {
    function MCApi() {
        this.url = this._makeUrl.apply(this, arguments);
        this.on_error = undefined;
        this.on_success = undefined;
    }

    MCApi.prototype._makeUrl = function () {
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
    }

    MCApi.prototype.success = function (on_success) {
        this.on_success = on_success;
        return this;
    }

    MCApi.prototype.error = function (on_error) {
        this.on_error = on_error;
        return this;
    }

    MCApi.prototype.arg = function (a) {
        /*
         ** There is always a ?apikey=xxx on the url so all additional args
         ** are &'d onto the url
         */
        this.url = this.url + "&" + a;
        return this;
    }

    MCApi.prototype.argWithValue = function (a, v) {
        this.url = this.url + "&" + a + "=" + v;
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
        'bad request': 'Error:  Please try again',
        'account exists': 'Error: Account already Exists',
        'usergroup exists': 'Error: Usergroup already exists. Try with new usergroup name',
        'problem adding tag': 'Error: There was a problem adding the tag'
    };
    return {
        get_alert_msg: function (key) {
            return alert_msg[key];
        }
    }
});


materialsCommonsServices.factory('Thumbnail', function () {
    var fileType = '';
    var fileSrc = '';
    return {
        fetch_images: function (datafiles) {
            var images = [];
            datafiles.forEach(function (item) {
                fileType = determineFileType(item.mediatype);
                if (fileType == 'image') {
                    fileSrc = filePath(fileType, item.mediatype, item.location, item.name);
                    images.push({'file': item, 'link': fileSrc})
                }

            });

            return images;
        }
    }
});


materialsCommonsServices.factory('formatData', function () {
    var all_process = [];
    return {
        convert_into_gridoptions: function (process) {
            process.forEach(function (pr) {
                var one_process = [];
                var keys = Object.keys(pr);
                keys.forEach(function (k) {
                    var template = {'name': k, 'value': pr[k]}
                    one_process.push(template);
                })
                all_process.push(one_process)
            })
            return all_process;
        },

        reformat_conditions: function (conditions) {
            var new_conditions_format = [];
            conditions.forEach(function (c) {
                var row = {'name': c, 'value': ''}
                new_conditions_format.push(row)
            })
            return new_conditions_format;
        }
    }
});

/*
 * The wizard service gives routines to write a wizard. The wizard is represented
 * as a tree. This means that any step can have substeps, and you substeps can have
 * substeps, ad nauseum.
 *
 * You can only have one wizard active at a time. Though this could be changed, it
 * was designed this way to facilitate communication of steps across different controllers.
 */
materialsCommonsServices.factory('wizard', function (pubsub) {
    var self = this;

    return {

        /*
         * Set the steps for the Wizard
         */
        setSteps: function (steps) {
            self.tree = new TreeModel();
            self.root = self.tree.parse(steps);
            self.current_step = self.root.model.step;
        },

        /*
         * Add substeps to an existing step.
         */
        addStep: function (toStep, child) {
            var nodeToAddTo = self.root.first(function (node) {
                if (node.model.step == toStep) {
                    return true;
                }
                return false;
            });

            this._addIfNotIn(nodeToAddTo, child);
        },

        /*
         * Only add children that don't exist.
         */
        _addIfNotIn: function (node, child) {
            if (!node) {
                return;
            }
            var stepname = child.step;
            var stepAlreadyExists = false;

            node.children.forEach(function (child) {
                if (stepname == child.step) {
                    stepAlreadyExists = true;
                }
            });

            if (!stepAlreadyExists) {
                var n = self.tree.parse(child);
                node.addChild(n);
            }
        },

        /*
         * Return the current step.
         */
        currentStep: function () {
            return self.current_step;
        },

        /*
         * Fire the step after the named step. Set current_step to the step
         * that was fired.
         */
        fireStepAfter: function (step) {
            var saw = false;
            self.root.walk({strategy: 'pre'}, function (node) {
                if (node.model.step == step) {
                    saw = true;
                } else if (saw) {
                    pubsub.send('wizard_next_step', node.model.step);
                    self.current_step = node.model.step;
                    return false;
                }

                return true;
            })
        },

        /*
         * Fires the step after current_step.
         */
        fireNextStep: function () {
            this.fireStepAfter(self.current_step);
        },

        /*
         * Check if stepAfter comes after step.
         */
        isAfterStep: function (step, stepAfter) {
            var sawStep = false;
            var isAfter = false;
            self.root.walk({strategy: 'pre'}, function (node) {
                if (node.model.step == step) {
                    sawStep = true;
                } else if (sawStep) {
                    if (node.model.step == stepAfter) {
                        isAfter = true;
                    }
                }
            });

            return isAfter;
        },

        /*
         * Check if stepAfter comes after current_step.
         */
        isAfterCurrentStep: function (stepAfter) {
            return this.isAfterStep(self.current_step, stepAfter);
        },

        /*
         * Check if substep is a substep of step. This is done by
         * checking the children of step, but not checking any deeper.
         */
        isSubStepOf: function (step, substep) {
            var node = this._getNode(step);
            if (node) {
                var foundMatch = false;
                node.children.forEach(function(child) {
                    if (child.model.step == substep) {
                        foundMatch = true;
                    }
                });

                return foundMatch;
            }

            return false;
        },

        /*
         * Retrieve the specified node.
         */
        _getNode: function (step) {
            var node = self.root.first(function (node) {
                if (node.model.step == step) {
                    return true;
                }
                return false;
            });

            return node;
        },

        /*
         * Fire the specified step. Set current_step to that step.
         */
        fireStep: function (step) {
            self.current_step = step;
            pubsub.send(this.channel(), step);
        },

        /*
         * Get the pubsub channel the wizard uses.
         */
        channel: function () {
            return 'wizard_next_step';
        },

        /*
         * Waits on the wizard pubsub channel for the step identified.
         * Calls the function when that step is fired.
         */
        waitOn: function (scope, step, f) {
            pubsub.waitOn(scope, this.channel(), function (currentStep) {
                if (currentStep == step) {
                    f();
                }
            });
        }
    }
});

