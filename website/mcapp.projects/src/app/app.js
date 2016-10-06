import './index.module';
import { setupRoutes } from './routes.js';
import { MCAppController } from './mc-app.controller';
import './global.services/index.module';
import './global.filters/index.module';
import './global.components/index.module';
import './login/index.module';
import './join/index.module';
import './model/index.module';
import './project/index.module';
import './projects/index.module';
import './user/index.module';
import './releasenotes/mc-release-notes.component';
import './util/util';

angular.module('materialscommons')
    .constant('mcglobals', setupMCGlobals())
    .config(appConfig)
    .run(appRun)
    .controller('MCAppController', MCAppController);

appConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$ariaProvider', '$compileProvider', 'hljsServiceProvider'];
function appConfig($stateProvider, $urlRouterProvider, $mdThemingProvider, $ariaProvider, $compileProvider, hljsServiceProvider) {
    setupMaterialsTheme($mdThemingProvider);
    setupRoutes($stateProvider, $urlRouterProvider);
    $ariaProvider.config({ariaChecked: false, ariaInvalid: false});
    $compileProvider.debugInfoEnabled(false);
    hljsServiceProvider.setOptions({
        // replace tab with 4 spaces
        tabReplace: '    '
    });
}

/*
 myApp.config(function (hljsServiceProvider) {
 hljsServiceProvider.setOptions({
 // replace tab with 4 spaces
 tabReplace: '    '
 });
 });
 */

appRun.$inject = ['$rootScope', 'User', 'Restangular', '$state', 'mcglobals', 'searchQueryText'];
function appRun($rootScope, User, Restangular, $state, mcglobals, searchQueryText) {
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

    var unregister = $rootScope.$on('$stateChangeStart', function(event, toState) {
        $rootScope.navbarSearchText = toState.name.startsWith('projects') ? 'SEARCH PROJECTS...' : 'SEARCH PROJECT...';
        if (!User.isAuthenticated() && isStateRequiringALogin(toState.name)) {
            event.preventDefault();
            $state.go('login');
        }

        if (!toState.name.startsWith('project.search')) {
            searchQueryText.set("");
        }
    });

    $rootScope.$on('$destroy', function() { unregister(); });
}

function isStateRequiringALogin(stateName) {
    switch (stateName) {
        case 'login':
        case 'join':
        case 'validate':
        case 'releasenotes':
            return false;
        default:
            return true;
    }
}

function setupMCGlobals() {
    var mcglobals = {};
    if (window.location.hostname === 'localhost') {
        mcglobals.apihost = window.location.protocol + '//localhost:5002';
    } else {
        mcglobals.apihost = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    }

    return mcglobals;
}

function setupMaterialsTheme($mdThemingProvider) {
    $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('red');
}
