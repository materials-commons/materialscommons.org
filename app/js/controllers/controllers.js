'use strict';

function FrontPageController($scope, $location) {
    $scope.messages = [];
    $scope.sent = 0;
    $scope.search_key = function () {
        $location.path("/searchindex/search_key/" + $scope.keyword);
    }


//    $scope.client = ngstomp('http://localhost:15674/stomp');
//    $scope.client.connect("guest", "guest", function(){
//        $scope.client.subscribe("/topic/test", function(message) {
//            $scope.messages.push(message.body);
//            if ($scope.sent == 0) {
//                $scope.client.send("/topic/test", {}, "from AngularStomp");
//                $scope.sent = 1;
//            }
//        });
//    }, function(){}, '/');

}

function HomeController($scope, $http) {
    var hostname = document.location.hostname;
    $scope.news = $http.jsonp(mcurljsonp('/news', 'a'))
        .success(function (data, status) {
            $scope.news = data;
        }).error(function (data, status, headers, config) {
        });
}


function DataSearchController($scope, Mcdb, $routeParams, $location) {
    // Nothing to do yet
    $scope.mcdb = Mcdb.db();
    $scope.imageSource = 'assets/img/BrightField.jpg';

    $scope.get_full_data_with_id = function (id) {
        $location.path("/data/data/" + id);

    }
    $scope.get_utc_obj = function (utc_in_sec) {
        var d = new Date(utc_in_sec * 1000);
        return d;
    }

    if ($routeParams.id) {
        $scope.full_data = $scope.mcdb.getDoc($routeParams.id);
    }
}


function ExploreController($scope, $http) {
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

function ReviewListController($scope, $http, $location, User) {
    $http.jsonp(mcurljsonp('/user/%/reviews', User.u()))
        .success(function (data) {
            $scope.reviews = _.filter(data, function(item) {
                if (!item.done) { return item; }
            });
        });

    $http.jsonp(mcurljsonp('/user/%/reviews/requested', User.u()))
        .success(function(data) {
            $scope.reviewsRequested = _.filter(data, function(item) {
                if (!item.done) { return item; }
            });
        });

    $scope.startReview = function (id, type) {
        if (type == "data") {
            $location.path("/data/edit/" + id);
        }
        else {
            console.log("datagroup not supported yet");
        }
    }

    $scope.removeReview = function (index) {
        var id = $scope.reviews[index].id;
        $http.delete(mcurl('/user/%/review/%', User.u(), id))
            .success(function (data) {
                console.log("success deleting");
                $scope.reviews.splice(index, 1);
            });
    }

    $scope.removeRequestedReview = function(index) {
        var id = $scope.reviewsRequested[index].id;
        $http.delete(mcurl('/user/%/review/%/requested', User.u(), id))
            .success(function() {
                $scope.reviewsRequested.splice(index, 1);
            })
    }
}


function EventController($scope, alertService) {
    $scope.$on('handleBroadcast', function() {
        $scope.message = {"type": "info",
            "content": alertService.message};
    });

}

