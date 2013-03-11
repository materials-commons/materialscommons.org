var app = angular.module('materialscommons', ['CornerCouch', 'ui', 'materialsCommonsServices']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
        when('/home', {templateUrl: 'partials/front-page.html', controller: FrontPageController}).
        when('/data', {templateUrl: 'partials/under-construction.html', controller: DataSearchController}).
        when('/models', {templateUrl: 'partials/under-construction.html', controller: ModelsSearchController}).
        when('/mylab/:tab/:subpage/:id', {templateUrl: 'partials/mylab/mylab.html', controller: MyLabTabController}).
        when('/login', {templateUrl: 'partials/login.html', controller: LoginController}).
        when('/explore', {templateUrl: 'partials/under-construction.html', controller: ExploreController}).
        when('/about', {templateUrl: 'partials/under-construction.html', controller: AboutController}).
        when('/contact', {templateUrl: 'partials/under-construction.html', controller: ContactController}).
        when('/help', {templateUrl: 'partials/under-construction.html', controller: HelpController}).
        otherwise({redirectTo: '/home'});
}
]);

app.run(function($rootScope, $location, User) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
//        console.dir(next);
//        console.log(next.templateUrl);
//        console.log(next.controller);
        if (matchesPartial(next, "partials/front-page", "ignore")) {
            setActiveMainNav("#home-nav");
        }
        else if (matchesPartial(next, "partials/mylab", "ignore")) {
            setActiveMainNav("#mylab-nav");
        }
        else if (matchesPartial(next, "partials/explore", "ExploreController")) {
            setActiveMainNav("#explore-nav");
        }
        else if (matchesPartial(next, "partials/about", "AboutController")) {
            setActiveMainNav('#about-nav');
        }
        else if (matchesPartial(next, "partials/contact", "ContactController")) {
            setActiveMainNav('#contact-nav');
        }
        else if (matchesPartial(next, "partials/help", "HelpController")) {
            setActiveMainNav("#help-nav");
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
