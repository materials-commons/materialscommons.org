Application.Services.factory('template.transform',
    [function () {
        return {
            toModelItem: function (item) {
                var modelItem = {
                    value: item.value,
                    unit: item.unit
                };

                return [modelItem, item.attribute];
            },

            toModel: function (template) {
                var model = {};

                function addToModel(what) {
                    var n = this.toModelItem(what),
                        val = n[0],
                        key = n[1];
                    model[key] = val;
                }

                template.default_properties.forEach(function (prop) {
                    addToModel(prop);
                });
                template.additional_properties.forEach(function (prop) {
                    addToModel(prop);
                });

                return model;
            }
        };
    }]);
