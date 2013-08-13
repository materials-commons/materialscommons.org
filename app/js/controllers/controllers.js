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

/*
 function UploadFileController($scope,uploadService, $rootScope ){
 $scope.clicked="false";
 $scope.count = 0;
 $scope.addButtonClicked = function(){
 $scope.count = $scope.count + 1;

 alert('in function');
 //var numFiles = $scope.fileList.length;
 //$scope.fileList.push({name: ('fileName' + numFiles)});
 }


 // 'files' is an array of JavaScript 'File' objects.
 $scope.files = [];
 $scope.$watch('files', function (newValue, oldValue) {
 // Only act when our property has changed.
 if (newValue != oldValue) {
 console.log('Controller: $scope.files changed. Start upload.');
 for (var i = 0, length = $scope.files.length; i < length; i++) {
 // Hand file off to uploadService.
 uploadService.send($scope.files[i]);
 }
 }
 }, true);

 $rootScope.$on('upload:loadstart', function () {
 console.log('Controller: on `loadstart`');
 });

 $rootScope.$on('upload:error', function () {
 console.log('Controller: on `error`');
 });


 }
 */


function ReviewListController($scope, $http, $location, User) {
    $http.jsonp(mcurljsonp('/user/%/reviews', User.u()))
        .success(function(data) {
            $scope.reviews = data;
        });

    $scope.startReview = function(id, type) {
        if (type == "data") {
            $location.path("/data/edit/" + id);
        }
        else {
            console.log("datagroup not supported yet");
        }
    }

    $scope.removeReview = function(index) {
        var id = $scope.reviews[index].id;
        $http.delete(mcurl('/user/%/review/%', User.u(), id))
            .success(function(data) {
                console.log("success deleting");
                $scope.reviews.splice(index, 1);
            });

    }
}

function EventController() {

}
