//Filter experiment or computation templates

Application.Filters.filter('templateFilter', function () {
    return function (templates, filter_type) {
        if (templates) {
            arr = [];
            for (var i = 0; i < templates.length; i++) {
                if (templates[i].template_pick == filter_type) {
                    arr.push(templates[i])
                }

            }
            return arr
        }
    };
});