(function (module) {
    module.filter('bytes', function () {
        return function (bytes) {
            var s = bytes ? bytes : 0;
            return bytesToSizeStr(s);
        };
    });
}(angular.module('materialscommons')));