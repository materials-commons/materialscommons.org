
var app = angular.module('materialscommons', ['CornerCouch', 'ui', 'materialsCommonsServices']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/materialscommons',
            {templateUrl:'partials/front-page.html', controller:FrontPageController}).
        when('/materialscommons/data',
            {templateUrl:'partials/under-construction.html', controller:DataSearchController}).
        when('/materialscommons/models',
            {templateUrl: 'partials/under-construction.html', controller: ModelsSearchController}).
        when('/materialscommons/mylab',
            {templateUrl: 'partials/mylab/experiment-list.html', controller: ExperimentListController}).
        when('/materialscommons/mylab/create',
            {templateUrl: 'partials/mylab/experiment.html', controller: ExperimentCreateEditController}).
        when('/materialscommons/experiment/:experimentId',
            {templateUrl:'partials/mylab/experiment.html', controller: ExperimentCreateEditController}).
        when('/login',
            {templateUrl: 'partials/login.html', controller: LoginController}).
        otherwise({redirectTo:'/materialscommons'});
}
]);

app.run(function($rootScope, $location, User) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        //console.log(next.templateUrl);
        if (true) { return;}
        if (! User.isAuthenticated()) {
            if (next.templateUrl && next.templateUrl.indexOf("partials/mylab") != -1) {
                $location.path("/login");
            }
        }
        else {
            //console.log("  User is authenticated");
        }
    });

});
