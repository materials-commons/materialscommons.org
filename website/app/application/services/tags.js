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
           removeTag: function (tag_id, item_id) {
                mcapi('/tags/%/item/%', tag_id, item_id)
                    .success(function (tag) {
                        return tag;
                    }).delete();
            }
        };
        return service;
    }]);
