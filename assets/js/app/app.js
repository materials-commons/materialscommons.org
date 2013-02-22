
var app = angular.module('materialscommons', ['CornerCouch', 'ui', 'ui.bootstrap', 'materialsCommonsServices']);

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
        //console.log(next.templateUrl);
        if (! User.isAuthenticated()) {
            if (next.templateUrl && next.templateUrl.indexOf("partials/notebook") != -1) {
                $location.path("/login");
            }
        }
        else {
            //console.log("  User is authenticated");
        }
    });

});
