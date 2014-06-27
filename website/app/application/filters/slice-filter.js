Application.Filters.filter('slice', function () {
    return function (items) {
        var new_array = [];
        if (items) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].type === 'id') {
                    new_array.push({'name': items[i].properties.name.value,
                        'display_name': items[i].properties.name.value.slice(0, 30),
                        'type': items[i].type,
                        'id': items[i].properties.id.value
                    })
                }
                else if (items[i].type === 'file') {
                    new_array.push({'name': items[i].properties.name.value,
                        'display_name': items[i].properties.name.value.slice(0, 30),
                        'type': items[i].type,
                        'id': items[i].properties.id.value
                    })
                }
                else if (items[i].type === 'condition') {
                    new_array.push({'name': items[i].template,
                        'display_name': items[i].template.slice(0, 30),
                        'type': items[i].type,
                        'id': ''})
                }

            }
        }
        return new_array
    };
});
