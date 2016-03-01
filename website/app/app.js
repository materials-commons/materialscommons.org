angular.module('materialscommons', []);

var app = angular.module('materialscommons',
    [
        'ngSanitize',
        'ngMessages',
        'ngMaterial',
        'ui.router',
        'restangular',
        'ui.tree',
        'RecursionHelper',
        'md.data.table',
        'angular.filter',
        'ui.calendar',
        'jmdobry.angular-cache',
        'ui.bootstrap',
        'angularGrid',
        'toastr',
        'ct.ui.router.extras.core', 'ct.ui.router.extras.transition',
        'ct.ui.router.extras.previous',
        'materialscommons']);

app.config(["$stateProvider", "$urlRouterProvider", "$mdThemingProvider",
    function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
        setupGlobalConfig();
        setupMaterialsTheme($mdThemingProvider);
        setupRoutes($stateProvider, $urlRouterProvider);
    }]);

app.run(["$rootScope", "User", "Restangular", "$state", appRun]);

function appRun($rootScope, User, Restangular, $state) {
    Restangular.setBaseUrl(mcglobals.apihost);

    // appRun will run when the application starts up and before any controllers have run.
    // This means it will run on a refresh. We check if the user is already authenticated
    // during the run. If they are then the browser has been refreshed and we need to
    // set the apikey param for Restangular. This param is set in the login-controller.
    // However on a refresh the login-controller isn't run so we need to explicitly set
    // the apikey param in Restangular.
    if (User.isAuthenticated()) {
        Restangular.setDefaultRequestParams({apikey: User.apikey()});
    }

    $rootScope.$on('$stateChangeStart', function (event, toState) {
        $rootScope.navbarSearchText = toState.name.startsWith('projects') ? 'SEARCH PROJECTS...' : 'SEARCH PROJECT...';
        if (!User.isAuthenticated() && toState.url !== '/login') {
            event.preventDefault();
            $state.go('login');
        }
    });
}

function setupGlobalConfig() {
    mcglobals = {};
    if (window.location.hostname === 'localhost') {
        mcglobals.apihost = window.location.protocol + '//localhost:5002';
    } else {
        mcglobals.apihost = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    }
}

function setupMaterialsTheme($mdThemingProvider) {
    $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('red');
}
