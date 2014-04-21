Application.Services.factory('Action',
    [function () {
        var choice = '';
        return {
            get_action: function () {
                return choice;
            },

            set_action: function (what) {
                choice = what;
                return choice;
            }
        };
    }]);