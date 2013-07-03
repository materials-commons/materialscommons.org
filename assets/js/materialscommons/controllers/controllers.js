'use strict';


function LoginController($scope, $location, $timeout, cornercouch, User, $rootScope) {

    console.log("LoginController");
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.alerts = [];
    $scope.failedLogin = false;
    $scope.successfulLogin = false;
    //$rootScope.me = User.get_username();
    //$rootScope.user_name = 'Login'

    $scope.login = function () {
        $scope.mcdb.query("materialscommons-app", "mcusers_by_email", {key: $scope.email})
            .success(function () {
                if ($scope.mcdb.rows.length > 0) {
                    console.log("Comparing passwords");
                    var db_password = $scope.mcdb.rows[0].value.password;
                    if (db_password == $scope.password) {
                        console.log("Inside of check");
                        $rootScope.user_name = $scope.mcdb.rows[0].value.user_name;
                        User.setAuthenticated(true, $scope.user_name);
                        $scope.failedLogin = false;
                        $scope.successfulLogin = true;
                        //$scope.me = User.get_username();
                        $timeout(function () {
                            $location.path("#/partials/user_functions/");
                        }, 2000);
                    } else {
                        $scope.failedLogin = true;
                    }
                } else {
                    $scope.failedLogin = true;
                }
            })
            .error(function () {
                console.log("Query Failed!!!");
            });
    }

    $scope.cancel = function () {
        $location.path("/home");
    }

    $scope.closeAlert = function () {
        $scope.alerts.splice(0, 1);
    }

    $scope.get_user_name = function () {
        $scope.user = User.get_username;
        console.log($scope.user);

    }

}

function LogOutController($scope, $rootScope, User) {
    $rootScope.user_name = '';
    User.setAuthenticated(false, '');
}

function AccountController($scope, $rootScope, $routeParams) {
    $scope.create_account = function () {
        console.log($scope.user_name);

    }

}

function MessagesController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "recent_events");
}

function ChartController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.chart_data = $scope.mcdb.getDoc("942ecdf121a6f788cc86a10a7e3e8ab6");
}

function FrontPageController($scope, $routeParams, $location, ngstomp) {
    $scope.messages = [];
    $scope.sent = 0;
    $scope.search_key = function () {
        $location.path("/searchindex/search_key/" + $scope.keyword);
    }

//    users.create('testuser', 'testing', {roles: ['example']}, function (err) {
//        if (err) {
//            console.log("Error adding user");
//            console.dir(err);
//        }
//    });


//    users.list(function (err, list) {
//        if (err) {
//            console.log("Error retrieving users");
//        }
//        else {
//            console.log("Users: ");
//            console.dir(list);
//        }
//    });

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

function HomeController($scope, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");

    $scope.mcdb.query("materialscommons-app", "news_by_date", {descending:true});
}


function DataSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ModelsSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ExploreController($scope, $routeParams) {
    $scope.pageDescription = "Explore";
}

function AboutController($scope, $routeParams, $rootScope) {
    $scope.pageDescription = "About";
}

function ContactController($scope, $routeParams) {
    $scope.pageDescription = "Contact";

}

function HelpController($scope, $routeParams) {
    $scope.pageDescription = "Help";
}


//Test Javascript to access keys
function AccessController($scope, $routeParams, cornercouch) {

    $scope.search_doc = function () {
        $scope.server = cornercouch();
        $scope.server.session();
        $scope.mcdb = $scope.server.getDB("angularphonecat");
        $scope.doc = $scope.mcdb.getDoc("86e8234752cca516c8b8ecdd68004122");
        //console.log($scope.doc);
    }
}


function DataGroupController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.list = $scope.mcdb.query("materialscommons-app", "all_experiments");

}
