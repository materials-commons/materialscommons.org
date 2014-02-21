Application.Filters.filter('data_by_user', function () {
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