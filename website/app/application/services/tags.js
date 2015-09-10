(function (module) {
    module.factory('tags', ["mcapi",
        function tags(mcapi) {
            return {
                tags: [],

                createTag: function (tag, item_id) {
                    mcapi('/tags/item/%', item_id)
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
        }]);
}(angular.module('materialscommons')));
