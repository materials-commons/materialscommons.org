//Filter experiment or computation templates

Application.Filters.filter('byKey', function () {
    return function (items, key, value) {
        var matches = [];
        if (items) {
            items.forEach(function(item) {
                if (key in item) {
                    if (item[key] === value) {
                        matches.push(item);
                    }
                }
            });
        }
        return matches;
    };
});


Application.Filters.filter('chopComposition', function () {
    return function (properties) {
        var matches = {};
        if (properties) {
           angular.forEach(properties, function(value, key){
              if (key !== 'composition'){
                  matches[key] =  value;
              }
           });
        }
        return matches;
    };
});

