(function(module) {
    module.directive("displayFile", displayFileDirective);
    function displayFileDirective() {
        return {
            restrict: "E",
            controller: 'DisplayFileDirectiveController',
            controllerAs: 'view',
            bindToController: true,
            scope: {
                file: '=file'
            },
            templateUrl: 'application/core/projects/project/files/display-file.html'
        };
    }

    module.controller("displayFileDirectiveController", DisplayFileDirectiveController);
    DisplayFileDirectiveController.$inject = ["mcfile"];

    /* @ngInject */
    function DisplayFileDirectiveController(mcfile) {
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
