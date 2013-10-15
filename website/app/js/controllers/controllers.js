'use strict';

function FrontPageController($scope, $location) {
    $scope.messages = [];
    $scope.sent = 0;
    $scope.search_key = function () {
        $location.path("/searchindex/search_key/" + $scope.keyword);
    }
}

function HomeController($scope, mcapi) {

    mcapi('/news')
        .success(function (data) {
            $scope.news = data;
        }).jsonp();
}



function ExploreController($scope) {
    $scope.pageDescription = "Explore";
}

function AboutController($scope) {
    $scope.pageDescription = "About";


}

function ContactController($scope, $routeParams) {
    $scope.pageDescription = "Contact";

}

function HelpController($scope, $routeParams) {
    $scope.pageDescription = "Help";
}

function ReviewListController($scope, $location, mcapi, User) {
    mcapi('/user/%/reviews', User.u())
        .success(function (data) {
            $scope.reviews = _.filter(data, function (item) {
                if (!item.done) {
                    return item;
                }
            });
        }).jsonp();

    mcapi('/user/%/reviews/requested', User.u())
        .success(function (data) {
            $scope.reviewsRequested = _.filter(data, function (item) {
                if (!item.done) {
                    return item;
                }
            });
        }).jsonp();

    $scope.startReview = function (id, type) {
        if (type == "data") {
            $location.path("/data/edit/" + id);
        }
        else {
        }
    }

    $scope.removeReview = function (index) {
        var id = $scope.reviews[index].id;
        mcapi('/user/%/review/%', User.u(), id)
            .success(function (data) {
                $scope.reviews.splice(index, 1);
            }).delete();
    }

    $scope.removeRequestedReview = function (index) {
        var id = $scope.reviewsRequested[index].id;
        mcapi('/user/%/review/%/requested', User.u(), id)
            .success(function () {
                $scope.reviewsRequested.splice(index, 1);
            }).delete()
    }
}

function EventController($scope, alertService) {
    $scope.message = '';
    $scope.$on('handleBroadcast', function () {
        $scope.message = {"type": "info",
            "content": alertService.message};
    });


}

function ProvenanceController($scope){
    $scope.process = [
        {
            name: 'TEM',
            owner: 'Allison'
        },
        {
            name: 'pr22',
            owner: 'Emanuelle'
        },
        {
            name: 'SEM',
            owner: 'Emanuelle'
        },
        {
            name: 'P4',
            owner: 'Allison'
        },
        {
            name: 'P5',
            owner: 'Emanuelle'
        }
    ];

}

