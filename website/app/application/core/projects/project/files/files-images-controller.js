(function (module) {
    module.controller("FilesImagesController", FilesImagesController);

    FilesImagesController.$inject = ["$state"];

    /* @ngInject */
    function FilesImagesController() {
        console.log("FileImagesController");
    }
}(angular.module('materialscommons')));
