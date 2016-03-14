(function (module) {
    module.factory("mcFlow", ["User", mcFlowService]);
    function mcFlowService(User) {
        var self = this;
        self.flow = new Flow(
            {
                target: target,
                testChunks: false,
                forceChunkSize: true,
                fileParameterName: "chunkData"
            }
        );

        function target() {
            return "/api/upload/chunk?apikey=" + User.apikey();
        }

        function each(obj, callback, context) {
            if (!obj) {
                return;
            }
            var key;
            // Is Array?
            if (typeof(obj.length) !== 'undefined') {
                for (key = 0; key < obj.length; key++) {
                    if (callback.call(context, obj[key], key) === false) {
                        return;
                    }
                }
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) {
                        return;
                    }
                }
            }
        }

        function extend(dst, src) {
            each(arguments, function (obj) {
                if (obj !== dst) {
                    each(obj, function (value, key) {
                        dst[key] = value;
                    });
                }
            });
            return dst;
        }

        self.service = {
            get: function () {
                return self.flow;
            }
        };

        return self.service;
    }
}(angular.module('materialscommons')));
