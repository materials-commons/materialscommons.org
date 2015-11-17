(function (module) {
    module.controller("FileEditController", FileEditController);

    FileEditController.$inject = ['file', '$scope'];

    /* @ngInject */
    function FileEditController(file, $scope) {
        console.log('FileEditController');
        var ctrl = this;
        ctrl.file = file;

        $scope.$on('$viewContentLoaded', function(event) {
            console.log('$viewContentLoaded', event);
        });
    }
}(angular.module('materialscommons')));