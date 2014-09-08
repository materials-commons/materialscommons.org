var recognized_images = ["jpg", "png", "jpeg", "gif", "tif", "tiff"];

function isImage(name) {
    var i;
    var s = name.toLowerCase();
    for (i = 0; i < recognized_images.length; i++) {
        if (endsWith(s, recognized_images[i])) {
            return true;
        }
    }

    return false;
}

function numberWithCommas(n) {
    n = n.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(n)) {
        n = n.replace(pattern, "$1,$2");
    }
    return n;
}

function bytesToSizeStr(bytes) {
    if(bytes == 0) return '0 Byte';
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];

}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function _add_json_callback(url) {
    return url + "&callback=JSON_CALLBACK";
}

function _add_json_callback2(url) {
    var qIndex = url.indexOf("?");
    var argSeparator = "&";
    if (qIndex == -1) {
        argSeparator = "?";
    }

    return url + argSeparator + "callback=JSON_CALLBACK";
}

String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};

// save a reference to the core implementation
var indexOfValue = _.indexOf;

// using .mixin allows both wrapped and unwrapped calls:
// _(array).indexOf(...) and _.indexOf(array, ...)
_.mixin({

    // return the index of the first array element passing a test
    indexOf: function (array, test) {
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
