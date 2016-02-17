(function (module) {
    module.component('mcfileEditControls', {
        templateUrl: 'components/file-tree/file/mc-file-edit-controls.html',
        controller: 'McfileEditControlsComponentController'
    });

    module.controller('McfileEditControlsComponentController', McfileEditControlsComponentController);
    McfileEditControlsComponentController.inject = [];
    function McfileEditControlsComponentController() {

    }
}(angular.module('materialscommons')));
