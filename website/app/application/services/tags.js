Application.Services.factory('Tags', [ "pubsub",
    function (pubsub) {
        var userTags = [];
        return {
            updateUserTags: function (tags) {
                this.userTags = tags;
                pubsub.send('tags.change')
            },
            getUserTags: function () {
                return this.userTags;
            }
        };
    }]);
