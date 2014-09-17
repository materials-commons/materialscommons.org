Application.Services.factory('review',
    ["mcapi", "model.projects", function (mcapi, Projects) {
        var service = {
            all_reviews: [],

            loadReviews: function() {
                var unmerged = [];
                Projects.getList(true).then(function (projects) {
                    projects.forEach(function(prj){
                        if(prj.reviews.length!==0){
                            unmerged.push(prj.reviews);
                        }
                    })
                    service.all_reviews = service.all_reviews.concat.apply(service.all_reviews, unmerged);
                     return service;
                });

            },
            getReviews: function() {
                console.log(service);
                return service.all_reviews;
            }

        };
        return service;
    }]);
