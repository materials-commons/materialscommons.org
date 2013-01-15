/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:10 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('notebook', ['CornerCouch']).
    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/experiments', {templateUrl: 'partials/does-not-exists.html', controller: ExperimentListController}).
            when('/experiments/:experimentId', {templateUrl: 'partials/experiment-detail.html',
                controller: ExperimentDetailController}).
            otherwise({redirectTo: 'experiments'});
    }
]);
