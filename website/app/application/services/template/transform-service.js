Application.Services.factory('template.TransformFactory',
    [function () {
        return {
            toModelItem: function (item) {
                var modelItem = {
                    value: item.value,
                    unit: item.unit
                };

                return [modelItem, item.attribute];
            },

            convert: function (template) {
                var model = {};

                function addToModel(what) {
                    var n = this.toModelItem(what),
                        val = n[0],
                        key = n[1];
                    model[key] = val;
                }

                template.default.forEach(function (prop) {
                    addToModel(prop);
                });
                template.additional.forEach(function (prop) {
                    addToModel(prop);
                });

                return model;
            }
        };
    }]);
