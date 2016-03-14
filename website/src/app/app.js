import { setupRoutes } from './routes.js';
import { MCAppController } from './mc-app.controller';
import { UserService } from './global.services/user.service';
import { CachedServiceFactoryService } from './global.services/cached-service-factory.service';
import { fileTypeService } from './global.services/file-type-service';
import { focusService } from './global.services/focus.service';
import { gridFiles } from './global.services/grid-files';
import { mcapiService } from './global.services/mcapi.service';
import { onChangeService } from './global.services/on-change.service';
import { previousStateService } from './global.services/previous-state.service';
import { projectsAPIService } from './global.services/projects-api.service';
import { projectsService } from './global.services/projects-service.service';
import { pubsubService } from './global.services/pubsub.service';
import { templateService } from './global.services/template.service';
import { templatesService } from './global.services/templates.service';

angular.module('materialscommons',
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
        'ct.ui.router.extras.previous'
    ])
    .config(["$stateProvider", "$urlRouterProvider", "$mdThemingProvider", appConfig])
    .run(["$rootScope", "User", "Restangular", "$state", "mcglobals", appRun])
    .constant('mcglobals', setupMCGlobals())
    .factory('User', UserService)
    .factory('CachedServiceFactory', CachedServiceFactoryService)
    .factory("fileType", fileTypeService)
    .factory('focus', focusService)
    .factory('gridFiles', gridFiles)
    .factory('mcapi', mcapiService)
    .factory('onChangeService', onChangeService)
    .factory('previousStateService', previousStateService)
    .factory('projectsAPI', projectsAPIService)
    .factory('projectsService', projectsService)
    .factory('pubsub', pubsubService)
    .factory('template', templateService)
    .factory("templates", templatesService)
    .controller('MCAppController', MCAppController);

function appConfig($stateProvider, $urlRouterProvider, $mdThemingProvider) {
    setupMaterialsTheme($mdThemingProvider);
    setupRoutes($stateProvider, $urlRouterProvider);
}

function appRun($rootScope, User, Restangular, $state, mcglobals) {
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

    $rootScope.$on('$stateChangeStart', function(event, toState) {
        $rootScope.navbarSearchText = toState.name.startsWith('projects') ? 'SEARCH PROJECTS...' : 'SEARCH PROJECT...';
        if (!User.isAuthenticated() && toState.url !== '/login') {
            event.preventDefault();
            $state.go('login');
        }
    });
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
