angular.module('materialscommons').directive("displayFileContents", displayFileContentsDirective);
function displayFileContentsDirective() {
    return {
        restrict: "E",
        controller: DisplayFileContentsDirectiveController,
        controllerAs: 'view',
        bindToController: true,
        scope: {
            file: '=file'
        },
        templateUrl: 'app/project/components/display-file-contents.html'
    };
}

/*@ngInject*/
function DisplayFileContentsDirectiveController(mcfile, mcmodal, isImage) {
    const ctrl = this;
    ctrl.fileSrc = mcfile.src(ctrl.file.id);
    ctrl.showImage = showImage;
    ctrl.downloadSrc = downloadSrc;

    let officeTypes = [
        {name: "application/vnd.ms-excel"},
        {name: "application/vnd.ms-powerpoint"},
        {name: "application/msword"},
        {name: "application/vnd.openxmlformats-officedocument.presentationml.presentation"},
        {name: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
        {name: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    ];

    let officeTypesMap = _.indexBy(officeTypes, 'name');

    ctrl.fileType = determineFileType(ctrl.file.mediatype);

    //////////////

    function determineFileType(mediatype) {
        if (isImage(mediatype.mime)) {
            return "image";
        }
        if (isOfficeFile(mediatype.mime)) {
            return "office";
        }
        switch (mediatype.mime) {
            case "application/pdf":
                return "pdf";
            case "application/octet-stream":
                return "binary";
            default:
                return mediatype.mime;
        }
    }

    function isOfficeFile(mime) {
        return (mime in officeTypesMap);
    }

    function showImage(file) {
        mcmodal.viewImage(file);
    }

    function downloadSrc() {
        return mcfile.downloadSrc(ctrl.file.id);
    }

}
