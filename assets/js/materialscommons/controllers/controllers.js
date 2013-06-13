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

function FrontPageController($scope, $routeParams, ngstomp) {
    $scope.messages = [];
    $scope.sent = 0;
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

function SearchController($scope, $routeParams, Search){
    //Method to Search repository using a keyword
    $scope.search = function(){
        $scope.noOfPages = 1;
        $scope.currentPage = 1;
        $scope.size = 5;
        $scope.newPage = 1;

        $scope.all_results = Search.get_all_phones($scope.keyword, function(all_results){
        $scope.total_hits = $scope.all_results.hits.total ;
        $scope.noOfPages = Math.round($scope.total_hits/$scope.size) ;
        $scope.$watch('currentPage', function(newPage){
            $scope.watchPage = newPage;

            //or any other code here
            $scope.from = $scope.size * (newPage - 1)
            $scope.results = Search.get_set_of_results_for_pagination($scope.keyword, $scope.from, $scope.size, function(results){
            });
        });
        scope.pageChanged = function(page) {
            scope.callbackPage = page;
            $scope.watchPage = newPage;
            };
        });

    }

}