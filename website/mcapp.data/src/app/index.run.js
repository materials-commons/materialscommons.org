export function runBlock($log, userService, $state, $rootScope, Restangular) {
    'ngInject';
    if (userService.isAuthenticated()) {
        Restangular.setDefaultRequestParams(['post', 'get', 'put', 'remove'], {apikey: userService.apikey()});
    } else {
        Restangular.setDefaultRequestParams(['get', 'post'], {apikey: userService.apikey()});
    }

    // the disable removes the error...
    // "$on" call should be assigned to a variable, in order to be destroyed during the $destroy event
    /* eslint-disable angular/on-watch */
    $rootScope.$on('$stateChangeStart', function(event, toState) {
        $rootScope.email = userService.email();
        //$rootScope.image = userService.image();
        // search bar under the top navigation will show up only for certain routes
        checkNavigationSearchBar(toState)
    });
    /* eslint-enable angular/on-watch */

    function checkNavigationSearchBar(toState) {
        if (toState.name.match(/(home)/g) || toState.name.match(/(search)/g)) {
            $rootScope.showSearchBar = false;
        } else {
            $rootScope.showSearchBar = true;
        }
    }
}
