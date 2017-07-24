function isImageService() {
    return function isImage(mime) {
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
    };
}

angular.module('materialscommons').factory('isImage', isImageService);
