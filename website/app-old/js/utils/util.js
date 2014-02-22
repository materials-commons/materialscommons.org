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

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

// save a reference to the core implementation
var indexOfValue = _.indexOf;

// using .mixin allows both wrapped and unwrapped calls:
// _(array).indexOf(...) and _.indexOf(array, ...)
_.mixin({

    // return the index of the first array element passing a test
    indexOf: function(array, test) {
        // delegate to standard indexOf if the test isn't a function
        if (!_.isFunction(test)) return indexOfValue(array, test);
        // otherwise, look for the index
        for (var x = 0; x < array.length; x++) {
            if (test(array[x])) return x;
        }
        // not found, return fail value
        return -1;
    }

});