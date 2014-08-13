Application.Services.factory('Tags',
    ["mcapi", function (mcapi) {

        return {
            get_tags: function () {
                var tags = [];
                mcapi('/tags/user')
                    .success(function (tags) {
                        var tags = tags;
                    }).jsonp();
                return tags;
            },

            update_tags: function (new_tag) {
                mcapi('/tags/user')
                    .success(function (tags) {

                    }).put(new_tag);
            }
        };
    }]);
