(function (module) {
    module.factory('Review',
        ["$filter", "mcapi", "User", "pubsub", '$state', function ($filter, mcapi, User, pubsub, $state) {
            var service = {
                checked_items: [],
                reviews: [],
                activeReview: {},
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
                            $state.go('projects.project.reviews.list', {category: 'closed'});
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

                setActiveReview: function (rev) {
                    service.activeReview = rev;
                    pubsub.send('activeReview.change');
                },

                getActiveReview: function () {
                    return service.activeReview;
                },

                setReviews: function (revs) {
                    service.reviews = revs;
                    pubsub.send('reviews.change');
                },

                getReviews: function () {
                    return service.reviews;
                },

                resetCheckedItems: function () {
                    service.checked_items = [];
                },

                checkedItems: function (item) {
                    var i = _.indexOf(service.checked_items, function (entry) {
                        return item.id === entry.id;
                    });
                    if (i < 0) {
                        service.checked_items.push(item);
                    } else {
                        service.checked_items.splice(i, 1);
                    }
                },

                getCheckedItems: function () {
                    return service.checked_items;
                },

                listReviewsByType: function (reviews, type) {
                    if (reviews.length > 0) {
                        service.setActiveReview(reviews[0]);
                        $state.go('projects.project.reviews.list.view', {category: type, review_id: reviews[0].id});
                    }
                }
            };
            return service;
        }]);
}(angular.module('materialscommons')));
