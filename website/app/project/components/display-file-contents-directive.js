(function (module) {
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
            templateUrl: 'project/components/display-file-contents.html'
        };
    }

    module.controller("DisplayFileContentsDirectiveController", DisplayFileContentsDirectiveController);
    DisplayFileContentsDirectiveController.$inject = ["mcfile", "mcmodal"];

    /* @ngInject */
    function DisplayFileContentsDirectiveController(mcfile, mcmodal) {
        var ctrl = this;
        ctrl.fileType = determineFileType(ctrl.file.mediatype);
        ctrl.fileSrc = mcfile.src(ctrl.file.id);
        ctrl.showImage = showImage;
        ctrl.downloadSrc = downloadSrc;

        //////////////

        function determineFileType(mediatype) {
            if (isImage(mediatype.mime)) {
                return "image";
            } else {
                switch (mediatype.mime) {
                case "application/pdf":
                    return "pdf";
                case "application/vnd.ms-excel":
                    return "xls";
                case "application/octet-stream":
                    return "binary";
                default:
                    return mediatype.mime;
                }
            }
        }

        function showImage(file) {
            mcmodal.viewImage(file);
        }

        function downloadSrc() {
            return mcfile.downloadSrc(ctrl.file.id);
        }

    }
}(angular.module('materialscommons')));
