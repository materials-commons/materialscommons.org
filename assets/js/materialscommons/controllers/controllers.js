'use strict';


function LoginController($scope, $location, $timeout, cornercouch, User) {

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.alerts = [];
    $scope.failedLogin = false;
    $scope.successfulLogin = false;

    $scope.login = function() {
        $scope.mcdb.query("materialscommons-app", "mcusers_by_email", {key: $scope.email})
            .success(function() {
                if ($scope.mcdb.rows.length > 0) {
                    console.log("Comparing passwords");
                    var db_password = $scope.mcdb.rows[0].value.password;
                    if (db_password == $scope.password) {
                        User.setAuthenticated(true);
                        $scope.failedLogin = false;
                        $scope.successfulLogin = true;
                        $timeout(function() {
                            $location.path("/mylab/myexperiments/experiment-list/");
                        }, 2000);
                    } else {
                        $scope.failedLogin = true;
                    }
                } else {
                    $scope.failedLogin = true;
                }
            })
            .error(function() {
                console.log("Query Failed!!!");
            });
    }

    $scope.cancel = function() {
        $location.path("/home");
    }

    $scope.closeAlert = function() {
        $scope.alerts.splice(0, 1);
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

function FrontPageController($scope, $routeParams,$location, ngstomp) {
    $scope.messages = [];
    $scope.sent = 0;
    $scope.search_key = function() {
          //$location.path("/search?keyword=" + $scope.keyword);
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

function DataSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ModelsSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ExploreController($scope, $routeParams) {
    $scope.pageDescription = "Explore";
}

function AboutController($scope, $routeParams) {
    $scope.pageDescription = "About";
}

function ContactController($scope, $routeParams) {
    $scope.pageDescription = "Contact";

}

function HelpController($scope, $routeParams) {
    $scope.pageDescription = "Help";
}



//Test Javascript to access keys
function AccessController($scope, $routeParams, cornercouch ){

    $scope.search_doc = function(){
        $scope.server = cornercouch();
        $scope.server.session();
        $scope.mcdb = $scope.server.getDB("angularphonecat");
        $scope.doc = $scope.mcdb.getDoc("86e8234752cca516c8b8ecdd68004122");
        //console.log($scope.doc);
    }
}


function DataGroupController($scope, $routeParams, cornercouch){
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.list = $scope.mcdb.query("materialscommons-app", "all_experiments");

}