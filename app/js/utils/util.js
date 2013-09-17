function setActiveMainNav(nav) {
    $('#mc-main-navs li').removeClass("active");
    $(nav).addClass("active");
}

function get_utc_obj(utc_in_sec) {
    var d = new Date(utc_in_sec * 1000);
    return d;
}

function determineFileType(mediaType) {
    if (mediaType.indexOf('image') != -1) {
        return "image";
    } else {
        return "other";
    }
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