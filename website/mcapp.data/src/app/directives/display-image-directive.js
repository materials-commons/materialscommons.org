export function DisplayImageDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/directives/display-image.html',
        scope: {
            file: "=",
            miniThumbnail: "@"
        },
        controller: DisplayImageController,
        controllerAs: 'ctrl',
        bindToController: true
    };
    return directive;
}

class DisplayImageController {

    constructor(userService) {
        'ngInject';
        this.file.src = "app/datafiles/static/" + this.file.original_id + "?apikey=" + userService.apikey();
        this.file.fileType = this.determineFileType(this.file.mediatype);
    }

    determineFileType(mediatype) {
        if (this.isImage(mediatype.mime)) {
            return "image";
        } else {
            switch (mediatype.mime) {
                case "application/pdf":
                    return "pdf";
                case "application/vnd.ms-excel":
                    return "xls";
                case "application/octet-stream":
                    return "binary";
                case "text/plain":
                    return "txt";
                default:
                    return mediatype.mime;
            }
        }
    }

    isImage(mime) {
        switch (mime) {
            case "image/gif":
            case "image/jpeg":
            case "image/png":
            case "image/tiff":
            case "image/x-ms-bmp":
            case "image/bmp":
                return true;
            default:
                return false;
        }
    }

    //showImage(file) {
    //  mcmodal.viewImage(file);
    //}

    downloadSrc() {
        this.file.downloadSrc = "app/datafiles/static/" + this.file.id + "?apikey=" + "35619b6840cc11e3a280ac162d80f1bf" + "&original=true";
    }
}
