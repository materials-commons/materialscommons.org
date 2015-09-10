(function (module) {
    module.controller("FilesByTypeController", FilesByTypeController);

    FilesByTypeController.$inject = ["$state"];

    /* @ngInject */
    function FilesByTypeController() {
        console.log("FileByTypeController");
    }

}(angular.module('materialscommons')));

