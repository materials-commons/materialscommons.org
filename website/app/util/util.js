function isImage(mime) {
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

function numberWithCommas(n) {
    n = n.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(n)) {
        n = n.replace(pattern, "$1,$2");
    }
    return n;
}

function bytesToSizeStr(bytes) {
    if(bytes === 0) return '0 Byte';
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

function differenceById(from, others) {
    var idsFrom = from.map(function(entry) {
        return entry.id;
    });
    var idsOthers = others.map(function(entry) {
        return entry.id;
    });

    var diff = _.difference(idsFrom, idsOthers);
    return from.filter(function(entry) {
        return _.indexOf(diff, function(e) {
            return e == entry.id;
        }) !== -1;
    });
}

function removeById(from, what) {
    var i = _.indexOf(from, function(item) {
        return item.id === what.id;
    });

    if (i !== -1) {
        from.splice(i, 1);
    }

    return i;
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

    //contains: function(list, value, fromIndex) {
    //    return _.includes(list, value, fromIndex);
    //}
});
