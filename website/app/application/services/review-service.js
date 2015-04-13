Application.Services.factory('Review',
    ["$filter", "mcapi", "User", "pubsub", function ($filter, mcapi, User, pubsub) {
        var service = {

            findReview: function (reviewID, which, project) {
                var i = _.indexOf(project[which], function (review) {
                    return review.id === reviewID;
                });
                return project[which][i];
            },

            closeReview: function (review_id, project) {
                var reviewID = review_id;
                mcapi('/reviews/%', reviewID)
                    .success(function () {
                        var review = service.findReview(reviewID, "reviews", project);
                        review.status = "closed";
                        service.reviewCount();
                    }).put({'status': 'closed'});
            },

            openReview: function (review_id, project) {
                var reviewID = review_id;
                mcapi('/reviews/%', reviewID)
                    .success(function () {
                        var review = service.findReview(reviewID, "reviews", project);
                        review.status = "open";
                        service.reviewCount();
                    }).put({'status': 'open'});
            },

            addComment: function (bk, review) {
                if (bk.comment.length === 0) {
                    return;
                }
                var d = new Date();
                review.messages.push({
                    'message': bk.comment,
                    'who': User.u(),
                    'date': d.toDateString()
                });
                mcapi('/reviews/%', review.id)
                    .success(function (data) {
                    }).put({'messages': review.messages});
            },

            reviewCount: function () {
                pubsub.send("reviews.change");
            },

            countMessages: function (review) {
                var count = 0;
                //Currently we have only one Assigned To . Later this should change to an array.
                review.messages.forEach(function (msg) {
                    if (msg.who === review.assigned_to) {
                        count++;
                    }
                });
                return count;
            },
            setActiveReview: function(rev_id, reviews){
                var i = _.indexOf(reviews, function(rev){
                    return rev.id === rev_id;
                });
                if (i !== -1){
                    service.activeReview = reviews[i];
                    pubsub.send('review.change');
                    return service.activeReview;
                }
            } ,
            getActiveReview: function(){
                return service.activeReview;
            }
        };
        return service;
    }]);
