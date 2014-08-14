Application.Services.factory('Tags',
    ["mcapi", "User", function (mcapi, User) {
        var allTags = [];
        return {
            getUserTags: function () {
                mcapi('/user/%/tags', User.u())
                    .success(function (user) {
                        allTags =  user.preferences.tags
                    }).jsonp();
                return allTags;
            },

            updateUserTags: function (new_tag) {
                mcapi('/user/%/tags', User.u())
                    .success(function (tags) {
                    }).put(new_tag);

            }

        }
    }]);
