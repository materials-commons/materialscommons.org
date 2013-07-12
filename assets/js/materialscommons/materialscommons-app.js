var app = angular.module('materialscommons', ['CornerCouch', 'ui', 'Filter', 'materialsCommonsServices', 'materialsdirective', 'jqyoui', 'AngularStomp',
                            'ui.bootstrap', 'smartTable.table', 'smartTable.column', 'flash']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    Stomp.WebSocketClass = SockJS;
    $routeProvider.
        when('/home', {templateUrl: 'partials/home.html', controller: HomeController}).
        when('/data', {templateUrl: 'partials/under-construction.html', controller: DataSearchController}).
        when('/models', {templateUrl: 'partials/under-construction.html', controller: ModelsSearchController}).
        when('/mylab/:tab/:subpage/:id', {templateUrl: 'partials/mylab/mylab.html', controller: MyLabTabController}).
        when('/searchindex/:subpage/:name', {templateUrl: 'partials/search_repository.html', controller: SearchIndexController}).
        when('/login', {templateUrl: 'partials/login.html', controller: LoginController}).
        when('/logout', {templateUrl: 'partials/about.html', controller: LogOutController}).
        when('/explore', {templateUrl: 'partials/under-construction.html', controller: ExploreController}).
        when('/about', {templateUrl: 'partials/about.html', controller: AboutController}).
        when('/contact', {templateUrl: 'partials/contact.html', controller: ContactController}).
        when('/help', {templateUrl: 'partials/help.html', controller: HelpController}).
        when('/search', {templateUrl: 'partials/search_repository.html', controller: SearchIndexController}).
        when('/datagroups', {templateUrl: 'partials/datagroups/my_data_groups.html', controller: DataGroupController}).
        when('/data_by_user', {templateUrl: 'partials/datagroups/user_data.html', controller: DataGroupController}).
        when('/my_lab', {templateUrl: 'partials/datagroups/my_lab.html', controller: DataGroupController}).
        when('/results_by_date', {templateUrl: 'partials/datagroups/results_by_date.html', controller: DataGroupController}).
        when('/user_functions', {templateUrl: 'partials/user_functions.html', controller: FrontPageController}).
        when('/create-account', {templateUrl: 'partials/create-account.html', controller: AccountController}).
        when('/dummy', {templateUrl: 'partials/data/1-bf-50k.tif', controller: FrontPageController}).
        when('/tags/list/:listtype', {templateUrl: 'partials/tags/tags-list.html', controller: TagListController}).
        when('/tags/data/bytag/:tag/:user', {templateUrl: 'partials/tags/data-for-tag.html', controller: TagDataController}).
        when('/data/edit/:id', {templateUrl: 'partials/data/data-edit.html', controller: DataEditController}).
        otherwise({redirectTo: '/home'});
}
]);
app.run(function ($rootScope, $location, User) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (matchesPartial(next, "partials/front-page", "HomeController")) {
            setActiveMainNav("#home-nav");
        }
        else if (matchesPartial(next, "partials/user_functions", "UserFunctionsController")) {
            setActiveMainNav("#user-nav");
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

        if (mcglobals.bypasslogin){
            if (mcglobals.username) {
                User.setAuthenticated(true, mcglobals.username);
            }
            return ;
        }

        if (!User.isAuthenticated()) {
            if (next.templateUrl && next.templateUrl.indexOf("partials/user_functions") != -1) {
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
