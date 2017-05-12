export function runBlock(userService, $rootScope, Restangular) {
    'ngInject';
    if (userService.isAuthenticated()) {
        Restangular.setDefaultRequestParams(['post', 'get', 'put', 'remove'], {apikey: userService.apikey()});
    } else {
        Restangular.setDefaultRequestParams(['get', 'post'], {apikey: userService.apikey()});
    }

    $rootScope.$on('$stateChangeStart', function (event, toState) {  // eslint-disable-line angular/on-watch
        $rootScope.email = userService.email();
        //$rootScope.image = userService.image();
        // search bar under the top navigation will show up only for certain routes
        checkNavigationSearchBar(toState)
    });

    function checkNavigationSearchBar(toState) {
        $rootScope.showSearchBar = !(toState.name.match(/(home)/g) || toState.name.match(/(search)/g));
    }
}
