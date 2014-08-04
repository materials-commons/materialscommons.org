Application.Services.factory('CachedServiceFactory',
    ["Restangular", "$angularCacheFactory", "User", "$q",
        function (Restangular, $angularCacheFactory, User, $q) {
            function CachedServiceFactory(route, options) {
                this.cacheName = route;
                var opts = options || { capacity: 100 };
                $angularCacheFactory(this.cacheName, opts);
                this.cache = $angularCacheFactory.get(this.cacheName);
                var cache = this.cache;
                var r = Restangular.withConfig(function (config) {
                    config.setBaseUrl(mcglobals.apihost);
                    config.setJsonp(true);
                    config.setDefaultRequestParams({apikey: User.apikey()});
                    config.setDefaultRequestParams('jsonp', {callback: 'JSON_CALLBACK'});
                    config.addResponseInterceptor(function (data, operation) {
                        function handleGetPost() {
                            var d = data.data;
                            cache.put(d.id, d);
                            return d;
                        }

                        function handleDelete() {
                            var id = data.id;
                            cache.remove(id);
                        }

                        function handleGetList() {
                            var items = data.data,
                                i,
                                l = items.length;

                            for (i = 0; i < l; i++) {
                                cache.put(items[i].id, items[i]);
                            }
                            return items;
                        }

                        if (operation === 'GET' || operation === 'POST') {
                            return handleGetPost();
                        }

                        if (operation === 'getList') {
                            return handleGetList();
                        }

                        if (operation === 'DELETE') {
                            handleDelete();
                        }

                        return data;
                    });
                });

                this.rest = r.all(route);
            }

            CachedServiceFactory.prototype = {
                get: function (id) {
                    var deferred = $q.defer(),
                        data = this.cache.get(id);

                    if (data) {
                        deferred.resolve(data);
                        return deferred.promise;
                    }

                    return this.rest.get(id);
                },

                create: function (what) {
                    return this.rest.post(what);
                },

                remove: function (id) {
                    return this.rest.remove(id);
                },

                clear: function() {
                    this.cache.removeAll();
                },

                getList: function () {
                    var keys = this.cache.keys(),
                        deferred = $q.defer(),
                        items = [],
                        i,
                        l;

                    if (keys.length === 0) {
                        return this.rest.getList();
                    }

                    for (i = 0, l = keys.length; i < l; i++) {
                        items.push(this.cache.get(keys[i]));
                    }
                    deferred.resolve(items);
                    return deferred.promise;
                }
            };

            return CachedServiceFactory;
        }]);
