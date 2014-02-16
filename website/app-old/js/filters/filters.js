var Filter = angular.module('Filter', []);

Filter.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

Filter.filter('private', function () {
    return function (list) {
        if (!list) {
            return;
        }
        var return_array = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].value.access == "private") {
                return_array.push(list[i]);
            }
        }
        return return_array;
    };

});

Filter.filter('public', function () {
    return function (list) {
        //console.log('entered filetr');
        var return_array = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].value.access == "public") {
                return_array.push(list[i]);
            }
        }
        return return_array;
    };

});

Filter.filter('data_by_user', function () {
    return function (list, user) {
        var return_array = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].key[0] == user[0]) {
                return_array.push(list[i]);
            }
        }
        return return_array;

    }
});

Filter.filter('truncate', function () {
    return function (text, length, end) {
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = ".....";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            return String(text).substring(0, length - end.length) + end;
        }

    };
});

Filter.filter('toDateString', function () {
    return function (input) {
        if (input) {
            var t = input.epoch_time;
            return new Date(t * 1000).toDateString();
        }
    }
});

Filter.filter('page', function () {
    return function (input, currentPage, pageSize) {
        var from = currentPage * pageSize;
        var to = from + pageSize;
        return input ? input.slice(from, to) : [];
    }
});

Filter.filter('splitDataDir', function () {
    return function (datadir) {
        return datadir.split('$')[1]
    }
});


Filter.filter('removeProperties', function () {
    return function (props, propsToRemove) {
        if (props) {
            var validProps = [];
            props.forEach(function(prop) {
                if (!(prop.name in propsToRemove)) {
                    validProps.push(prop);
                }
            });
            //console.log(validProps);
            return validProps;
        }
    }
});

Filter.filter('reverse', function () {
    return function () {
        start = +start; //parse to int
        return input.slice(start);
    }
});





