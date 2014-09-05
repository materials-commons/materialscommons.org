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
                                console.log("adding to cache id:" + items[i].id);
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
                    console.log("get looking up id: " + id);
                    var deferred = $q.defer(),
                        data = this.cache.get(id);

                    if (data) {
                        deferred.resolve(data);
                        return deferred.promise;
                    }

                    console.log("get not in cache");
                    return this.rest.get(id, {apikey: User.apikey()});
                },

                create: function (what) {
                    return this.rest.post(what, {apikey: User.apikey()});
                },

                remove: function (id) {
                    return this.rest.remove(id, {apikey: User.apikey()});
                },

                clear: function() {
                    this.cache.removeAll();
                },

                getList: function (reload) {
                    var keys,
                        deferred,
                        items = [],
                        i,
                        l;

                    if (reload) {
                        this.cache.removeAll();
                    }

                    keys = this.cache.keys();
                    deferred = $q.defer();

                    if (keys.length === 0) {
                        return this.rest.getList({apikey: User.apikey()});
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
