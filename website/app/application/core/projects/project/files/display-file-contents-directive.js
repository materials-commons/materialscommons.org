(function(module) {
    module.directive("displayFileContents", displayFileContentsDirective);
    function displayFileContentsDirective() {
        return {
            restrict: "E",
            controller: 'DisplayFileContentsDirectiveController',
            controllerAs: 'view',
            bindToController: true,
            scope: {
                file: '=file'
            },
            templateUrl: 'application/core/projects/project/files/display-file-contents.html'
        };
    }

    module.controller("DisplayFileContentsDirectiveController", DisplayFileContentsDirectiveController);
    DisplayFileContentsDirectiveController.$inject = ["mcfile"];

    /* @ngInject */
    function DisplayFileContentsDirectiveController(mcfile) {
        var ctrl = this;
        ctrl.fileType = determineFileType(ctrl.file.mediatype);
        ctrl.fileSrc = mcfile.src(ctrl.file.id);

        //////////////

        function determineFileType(mediatype) {
            if (isImage(mediatype.mime)) {
                return "image";
            } else {
                switch(mediatype.mime) {
                case "application/pdf":
                    return "pdf";
                case "application/vnd.ms-excel":
                    return "excel";
                default:
                    return mediatype.mime;
                }
            }
        }
    }
}(angular.module('materialscommons')));
