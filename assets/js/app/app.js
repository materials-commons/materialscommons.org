
var app = angular.module('materialscommons', ['CornerCouch', 'ui', 'materialsCommonsServices']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/materialscommons',
            {templateUrl:'partials/front-page.html', controller:FrontPageController}).
        when('/materialscommons/data',
            {templateUrl:'partials/under-construction.html', controller:DataSearchController}).
        when('/materialscommons/models',
            {templateUrl: 'partials/under-construction.html', controller: ModelsSearchController}).
        when('/materialscommons/notebook',
            {templateUrl: 'partials/notebook/experiment-list.html', controller: ExperimentListController}).
        when('/materialscommons/notebook/create',
            {templateUrl: 'partials/notebook/experiment.html', controller: ExperimentCreateEditController}).
        when('/materialscommons/experiment/:experimentId',
            {templateUrl:'partials/notebook/experiment.html', controller: ExperimentCreateEditController}).
        when('/login',
            {templateUrl: 'partials/login.html', controller: LoginController}).
        otherwise({redirectTo:'/materialscommons'});
}
]);

app.run(function($rootScope, $location, User) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        console.log(next.templateUrl);
        if (! User.isAuthenticated()) {
            console.log("  User not authenticated");

            if (next.templateUrl && next.templateUrl.indexOf("partials/notebook") != -1) {
                console.log("  Going to labnotebook");
                $location.path("/login");
                console.log("  User authentication = " + User.isAuthenticated());
            }
        }
        else {
            console.log("  User is authenticated");
        }
    });

});
