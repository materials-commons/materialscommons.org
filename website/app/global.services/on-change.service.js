(function(module) {
    module.factory('onChangeService', onChangeService);
    onChangeService.$inject = [];
    function onChangeService() {
        var onChangeFn = null;
        return {
            register: function(scope, fn) {
                onChangeFn = fn;
                scope.$on('$destroy', function () {
                    onChangeFn = null;
                });
            },

            execif: function() {
                if (onChangeFn) {
                    onChangeFn.apply(this, arguments);
                }
            }
        }
    }
}(angular.module('materialscommons')));
