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

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function _add_json_callback(url) {
    return url + "&callback=JSON_CALLBACK";
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