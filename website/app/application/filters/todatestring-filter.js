Application.Filters.filter('toDateString', function () {
    return function (input) {
        if (input) {
            var t = input.epoch_time;
            s = new Date(t * 1000).toDateString();
            return s;
        }
        return "";
    };
});

//Application.Filters.filter('simplifyJavascriptDate', function () {
//    return function (input) {
//        if (input) {
//            console.log(input);
//            var s = new Date(myDate.getYear(), myDate.getMonth(), myDate.getDate());
//            return s;
//        }
//        return "";
//    };
//});
