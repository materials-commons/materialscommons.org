(function (module) {
    module.directive('fileUploadPanel', fileUploadPanelDirective);
    function fileUploadPanelDirective() {
        return {
            restrict: "E",
            replace: true,
            controller: 'FileUploadPanelDirectiveController',
            scope: true,
            controllerAs: 'uploader',
            bindToController: true,
            templateUrl: 'application/directives/file-upload-panel.html'
        };
    }

    ///////////////////////////////////////////////////

    module.controller("FileUploadPanelDirectiveController", FileUploadPanelDirectiveController);
    FileUploadPanelDirectiveController.$inject = ["mcFlow", "$timeout"];

    /* @ngInject */
    function FileUploadPanelDirectiveController(mcFlow, $timeout) {
        var ctrl = this;

        ctrl.filesByDir = {};
        ctrl.dirCount = 0;
        ctrl.flow = mcFlow.get();
        ctrl.flow.on('catchAll', function (eventName) {
            // Force a dirty check of the changed flow state.
            $timeout(function () {
                if (eventName === "filesAdded" || eventName === "fileRemoved") {
                    loadFilesByDir();
                }
            });
        });

        /////////////////////////

        function loadFilesByDir() {
            var files = ctrl.flow.files;
            ctrl.filesByDir = {}; // reset the list

            // Load files indexed by the directory
            files.forEach(function (file) {
                if (!(file.attrs.directory_name in ctrl.filesByDir)) {
                    ctrl.filesByDir[file.attrs.directory_name] = [];
                }
                ctrl.filesByDir[file.attrs.directory_name].push(file);
            });
        }
    }

}(angular.module('materialscommons')));
