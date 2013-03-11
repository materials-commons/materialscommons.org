var app = angular.module('materialscommons', ['CornerCouch', 'ui', 'materialsCommonsServices']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
        when('/materialscommons', {templateUrl: 'partials/front-page.html', controller: FrontPageController}).

        when('/materialscommons/data',
        {templateUrl: 'partials/under-construction.html', controller: DataSearchController}).

        when('/materialscommons/models',
        {templateUrl: 'partials/under-construction.html', controller: ModelsSearchController}).

        when('/materialscommons/mylab/:tab/:subpage/:id', {templateUrl: 'partials/mylab/mylab.html', controller: MyLabTabController}).
//            {templateUrl: 'partials/mylab/experiment-list.html', controller: ExperimentListController}).

        when('/materialscommons/mylab/create',
        {templateUrl: 'partials/mylab/experiment.html', controller: ExperimentCreateEditController}).

        when('/materialscommons/experiment/:experimentId',
        {templateUrl: 'partials/mylab/experiment.html', controller: ExperimentCreateEditController}).

        when('/login', {templateUrl: 'partials/login.html', controller: LoginController}).

        otherwise({redirectTo: '/materialscommons'});
}
]);

app.run(function($rootScope, $location, User) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
//        console.dir(next);
//        console.log(next.templateUrl);
//        console.log(next.controller);
        if (matchesPartial(next, "partials/front-page", "ignore")) {
            console.log("home");
            setActiveMainNav("#home-nav");
        }
        else if (matchesPartial(next, "partials/mylab", "ignore")) {
            console.log("mylab");
            setActiveMainNav("#mylab-nav");
        }
//        else if (matchesPartial(next, "partials/data", "DataSearchController")) {
//            setActiveMainNav("#finddata");
//        }
//        else if (matchesPartial(next, "partials/models", "ModelsSearchController")) {
//            setActiveMainNav("#findmodels");
//        }

        if (true) {
            return;
        }
        if (!User.isAuthenticated()) {
            if (next.templateUrl && next.templateUrl.indexOf("partials/mylab") != -1) {
                $location.path("/login");
            }
        }
        else {
            //console.log("  User is authenticated");
        }
    });

});

function matchesPartial(next, what, controller) {
    if (!next.templateUrl) {
        return false;
    }
    else {
        var value = next.templateUrl.indexOf(what) != -1;
        /*
        Hack to look at controller name to figure out tab. We do this so that partials can be
        shared by controllers, but we need to show which tab is active. So, we look at the
        name of the controller (only if controller != 'ignore').
         */
        if (controller == "ignore") {
            return value;
        }
        else if (value) {
            return true;
        }
        else {
            return next.controller.toString().indexOf(controller) != -1;
        }
    }
}
