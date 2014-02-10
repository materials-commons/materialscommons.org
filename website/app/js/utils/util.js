function setActiveMainNav(nav) {
    $('#mc-main-navs li').removeClass("active");
    $(nav).addClass("active");
}

function determineFileType(mediaType) {
    if (mediaType.indexOf('image') != -1) {
        return "image";
    } else {
        return "other";
    }
}

var recognized_images = ["jpg", "png", "jpeg", "gif"];

function isImage(name) {
    var s = name.toLowerCase();
    for (var i = 0; i < recognized_images.length; i++) {
        if (endsWith(s, recognized_images[i])) {
            return true;
        }
    }

    return false;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function _add_json_callback(url) {
    return url + "&callback=JSON_CALLBACK";
}

function filePath(fileType, mediaType, location, name) {
    var filePath = "assets/materialscommons/";
    if (fileType == "image" && mediaType == "image/tiff") {
        var newName = name.substr(0, name.lastIndexOf('.')) || name;
        newName = newName + '.jpg';
        return filePath + location + '/.conversion/' + newName;
    } else if (fileType == "image") {
        return filePath + location + '/' + name;
    } else {
        return filePath + location + '/' + name;
    }

    return filePath;
}

function originalFilePath(location, name) {
    var filePath = "assets/materialscommons/";
    return filePath + location + '/' + name;
}