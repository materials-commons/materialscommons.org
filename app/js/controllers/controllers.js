'use strict';


function LoginController($scope, $location, $timeout, User, $rootScope) {
//    $scope.server = cornercouch();
//    $scope.server.session();
//    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.alerts = [];
    $scope.failedLogin = false;
    $scope.successfulLogin = false;
    //$rootScope.me = User.u();
    //$rootScope.user_name = 'Login'

    $scope.login = function () {
        $scope.mcdb.query("materialscommons-app", "mcusers_by_email", {key: $scope.email})
            .success(function () {
                if ($scope.mcdb.rows.length > 0) {
                    console.log("Comparing passwords");
                    var db_password = $scope.mcdb.rows[0].value.password;
                    if (db_password == $scope.password) {
                        $rootScope.email_address = $scope.mcdb.rows[0].value.email;
                        User.setAuthenticated(true, $scope.email);
                        $scope.failedLogin = false;
                        $scope.successfulLogin = true;
                        $scope.connectError = false;
                        $location.path('/my-tools');
                        //$timeout(function() {
                        //  $location.path("/my-tools");
                        //}, 2000);
                    } else {
                        $scope.failedLogin = true;
                    }
                } else {
                    $scope.failedLogin = true;
                }
            })
            .error(function () {
                $scope.connectError = true;
            });
    }

    $scope.cancel = function () {
        $location.path("/home");
    }

    $scope.closeAlert = function () {
        $scope.alerts.splice(0, 1);
    }

    $scope.get_user_name = function () {
        $scope.user = User.u();
        console.log($scope.user);

    }

}

function LogOutController($scope, $rootScope, User) {
    $rootScope.email_address = '';
    User.setAuthenticated(false, '');
}

function AccountController($scope, $rootScope, $routeParams, $location, flash) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.create_account = function () {
        //console.log($scope.user_name) ;
        $scope.new_account = $scope.mcdb.newDoc();
        $scope.new_account.password = $scope.password;
        //$scope.new_account.confirm_password =   $scope.confirm_password;
        $scope.new_account.email = $scope.email;
        //$scope.new_account.confirm_email = $scope.confirm_email;
        $scope.new_account.type = 'mcuser';
        $scope.mcdb.query("materialscommons-app", "mcusers_by_email", {key: $scope.email}).success(function () {
            if ($scope.mcdb.rows.length > 0) {
                alert('Account has already been created using ' + $scope.email);
                $location.path('/account/create-account');
            }
            else {
                if (($scope.password == $scope.confirm_password) && ($scope.email == $scope.confirm_email)) {
                    $scope.new_account.save();
                    flash("Account Created");
                    $location.path('/account/login');
                }
                else {
                    alert("Unable to Create Your Account. Confirmation is being entered incorrectly");
                    $location.path('/account/create-account');
                }

            }
        });
    }
}


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
