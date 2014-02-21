Application.Services.factory('Attributes',
    [function () {
        return {
            toObject: function (model) {
                var o = {},
                    name = model["name"].toLowerCase().replace(/ /g, "_"),
                    value = model["value"],
                    unit = model["unit"];
                o[name] = {
                    value: value,
                    unit: unit
                };
                return o;
            },

            fromObject: function (o) {
                var model = {
                    "name": o.name.capitalize.replace(/_/g, " "),
                    "unit": o.unit,
                    "value": o.value
                }
                return model;
            }
        };
    }]);