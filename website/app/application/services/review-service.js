Application.Services.factory('review',
    ["mcapi", "model.projects", function (mcapi, Projects) {
        var service = {
            all_reviews: [],

            loadReviews: function() {


            },
            getReviews: function() {
                return service.all_reviews;
            }

        };
        return service;
    }]);
