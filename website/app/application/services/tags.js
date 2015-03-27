Application.Services.factory('tags', ["mcapi",
    function tags(mcapi) {
        var service = {
            tags: [],

            createTag: function (tag) {
                mcapi('/tags')
                    .success(function (tag) {
                        return tag;
                    }).post(tag);
            },
           removeTag: function (tag) {
                mcapi('/tags/%/item/%')
                    .success(function (tag) {
                        return tag;
                    }).delete(tag);
            }
        };
        return service;
    }]);
